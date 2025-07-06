import { useDark, useToggle } from '@vueuse/core'
import { computed, watch } from 'vue'

/**
 * 主题管理 composable
 * 使用 VueUse 的 useDark 实现动态主题切换
 * 同时支持思源笔记主题同步
 * 参考：https://vueuse.org/core/useDark/
 */
export function useTheme() {
  // 更新 Element Plus 主题
  const updateElementPlusTheme = (isDarkMode: boolean) => {
    const htmlElement = document.documentElement
    
    if (isDarkMode) {
      // 添加暗色主题类
      htmlElement.classList.add('dark')
      // 设置 Element Plus 暗色主题属性
      htmlElement.setAttribute('data-theme', 'dark')
    } else {
      // 移除暗色主题类
      htmlElement.classList.remove('dark')
      // 设置 Element Plus 亮色主题属性
      htmlElement.setAttribute('data-theme', 'light')
    }
    
    console.log('Element Plus 主题已更新:', isDarkMode ? '暗色' : '亮色')
  }

  // 使用 useDark 管理暗黑模式状态
  // 默认使用 Tailwind CSS 的方式：在 html 标签上添加 'dark' 类
  const isDark = useDark({
    // 存储键名，用于持久化主题偏好
    storageKey: 'taskmap-theme',
    // 选择器，默认为 'html'
    selector: 'html',
    // 属性名，默认为 'class'
    attribute: 'class',
    // 暗色模式的值，默认为 'dark'
    valueDark: 'dark',
    // 亮色模式的值，默认为 ''
    valueLight: '',
    // 自定义变化处理函数
    onChanged: (dark: boolean) => {
      console.log('主题切换:', dark ? '暗色' : '亮色')
      // 更新 Element Plus 主题
      updateElementPlusTheme(dark)
    }
  })

  // 创建切换函数
  const toggleTheme = useToggle(isDark)

  // 计算当前主题字符串
  const currentTheme = computed(() => isDark.value ? 'dark' : 'light')

  // 设置主题
  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
  }

  // 获取系统主题偏好
  const isSystemDark = computed(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // 思源主题检测和同步
  const detectSiyuanTheme = async () => {
    try {
      const siyuan = (window as any).siyuan
      if (!siyuan) return

      // 方式1：通过API获取思源设置
      if (siyuan.ws) {
        try {
          const response = await fetch('/api/setting/getAppearance')
          if (response.ok) {
            const responseText = await response.text()
            if (responseText) {
              try {
                const appearance = JSON.parse(responseText)
                const theme = appearance.data?.theme || appearance.data?.mode || appearance.theme || appearance.mode
                
                if (theme !== undefined) {
                  // 思源的主题值：0=明亮, 1=暗黑, 2=跟随系统
                  if (theme === 1 || theme === 'dark') {
                    setTheme('dark')
                    return
                  } else if (theme === 0 || theme === 'light') {
                    setTheme('light')
                    return
                  } else if (theme === 2 || theme === 'system') {
                    setTheme(isSystemDark.value ? 'dark' : 'light')
                    return
                  }
                }
              } catch (parseError) {
                console.log('API解析失败，尝试其他方式')
              }
            }
          }
        } catch (apiError) {
          console.log('API获取失败，尝试其他方式')
        }
      }

      // 方式2：从window.siyuan.config获取
      if (siyuan.config) {
        const configPaths = [
          'appearance.theme',
          'appearance.mode',
          'theme',
          'mode',
          'appearance.themeMode'
        ]
        
        for (const path of configPaths) {
          const value = path.split('.').reduce((obj, key) => obj?.[key], siyuan.config)
          if (value !== undefined) {
            if (value === 1 || value === 'dark') {
              setTheme('dark')
              return
            } else if (value === 0 || value === 'light') {
              setTheme('light')
              return
            } else if (value === 2 || value === 'system') {
              setTheme(isSystemDark.value ? 'dark' : 'light')
              return
            }
          }
        }
      }

      // 方式3：检查HTML的data-theme属性
      const htmlElement = document.documentElement
      const isDarkTheme = htmlElement.getAttribute('data-theme') === 'dark'
      setTheme(isDarkTheme ? 'dark' : 'light')
      
    } catch (error) {
      console.error('获取思源主题设置失败:', error)
      // 最终备用方案
      const htmlElement = document.documentElement
      const isDarkTheme = htmlElement.getAttribute('data-theme') === 'dark'
      setTheme(isDarkTheme ? 'dark' : 'light')
    }
  }

  // 监听思源主题变化
  const setupSiyuanThemeListener = () => {
    const siyuan = (window as any).siyuan
    if (siyuan && siyuan.eventBus) {
      console.log('思源事件总线可用，开始监听主题变化')
      
      // 监听主题变化事件
      siyuan.eventBus.on('ws-main', (data: any) => {
        if (data && data.cmd === 'setAppearance') {
          console.log('检测到思源主题变化事件:', data)
          setTimeout(() => detectSiyuanTheme(), 100) // 延迟一点确保设置已更新
        }
      })
    } else {
      console.log('思源事件总线不可用，使用备用监听方案')
      
      // 备用方案：监听HTML属性变化
      const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            console.log('检测到HTML主题属性变化')
            detectSiyuanTheme()
          }
        })
      })
      
      // 开始监听
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      })
    }
  }

  // 监听系统主题变化（当思源设置为跟随系统时）
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      console.log('系统主题变化:', e.matches ? '暗色' : '亮色')
      // 重新检测思源主题，因为可能设置为跟随系统
      detectSiyuanTheme()
    })
  }

  // 初始化主题检测
  const initTheme = async () => {
    console.log('初始化主题检测...')
    await detectSiyuanTheme()
    setupSiyuanThemeListener()
    setupSystemThemeListener()
    
    // 确保初始主题正确设置
    updateElementPlusTheme(isDark.value)
    
    console.log('主题检测初始化完成，当前主题:', currentTheme.value)
  }

  // 监听主题变化，确保 Element Plus 主题同步
  watch(isDark, (newValue) => {
    updateElementPlusTheme(newValue)
  }, { immediate: true })

  return {
    isDark,
    currentTheme,
    toggleTheme,
    setTheme,
    isSystemDark,
    detectSiyuanTheme,
    initTheme,
    updateElementPlusTheme
  }
} 