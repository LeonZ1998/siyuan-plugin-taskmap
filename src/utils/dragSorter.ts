// 通用拖拽排序工具类
// 提供可复用的拖拽排序功能，适用于项目卡片、任务卡片等

export interface DragSorterConfig {
  container: HTMLElement;
  itemSelector: string;
  dragHandleSelector: string;
  placeholderClass: string;
  onOrderChange: (itemId: string, newOrder: number) => Promise<void>;
  onReorderComplete?: (itemId: string, newOrder: number) => void;
}

export interface DragState {
  isDragging: boolean;
  draggedElement: HTMLElement | null;
  draggedItemId: string | null;
  startY: number;
  placeholder: HTMLElement | null;
}

export class DragSorter {
  private config: DragSorterConfig;
  private dragState: DragState = {
    isDragging: false,
    draggedElement: null,
    draggedItemId: null,
    startY: 0,
    placeholder: null
  };

  constructor(config: DragSorterConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    // 绑定拖拽事件到容器
    this.config.container.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      const dragHandle = target.closest(this.config.dragHandleSelector);
      
      if (dragHandle) {
        e.preventDefault();
        const item = dragHandle.closest(this.config.itemSelector) as HTMLElement;
        if (item) {
          const itemId = item.getAttribute('data-project-id') || 
                        item.getAttribute('data-task-id') || 
                        item.getAttribute('data-id');
          if (itemId) {
            this.startDrag(item, itemId);
          }
        }
      }
    });
  }

  private startDrag(item: HTMLElement, itemId: string) {
    if (this.dragState.isDragging) {
      return;
    }

    // 设置拖拽状态
    this.dragState.isDragging = true;
    this.dragState.draggedElement = item;
    this.dragState.draggedItemId = itemId;
    this.dragState.startY = item.offsetTop;

    // 创建拖拽时的视觉反馈
    item.style.opacity = '0.5';
    item.style.transform = 'rotate(2deg)';
    item.style.position = 'fixed';
    item.style.zIndex = '1000';
    item.style.width = item.offsetWidth + 'px';
    item.style.pointerEvents = 'none';
    item.style.top = item.offsetTop + 'px';
    item.style.left = item.offsetLeft + 'px';
    
    // 添加拖拽时的样式
    item.classList.add('dragging');

    // 创建占位符
    this.createPlaceholder(item);

    // 监听鼠标移动
    const handleMouseMove = (e: MouseEvent) => {
      if (!this.dragState.isDragging) return;

      // 更新拖拽元素位置
      item.style.top = e.clientY - item.offsetHeight / 2 + 'px';

      // 更新占位符位置
      this.updatePlaceholderPosition(e.clientY);
    };
    
    // 监听鼠标释放
    const handleMouseUp = async () => {
      if (!this.dragState.isDragging) return;

      // 完成拖拽排序
      await this.finishDrag();

      // 移除事件监听
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // 添加事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private createPlaceholder(originalElement: HTMLElement) {
    const placeholder = document.createElement('div');
    placeholder.className = `${this.config.itemSelector.replace('.', '')} ${this.config.placeholderClass}`;
    placeholder.style.height = originalElement.offsetHeight + 'px';
    placeholder.style.marginBottom = originalElement.style.marginBottom || '12px';
    placeholder.style.border = '2px dashed var(--b3-border-color)';
    placeholder.style.backgroundColor = 'transparent';
    placeholder.style.opacity = '0.6';

    // 插入到原始位置
    originalElement.parentNode?.insertBefore(placeholder, originalElement);
    this.dragState.placeholder = placeholder;
  }

  private updatePlaceholderPosition(mouseY: number) {
    if (!this.dragState.placeholder || !this.dragState.draggedElement) return;

    const itemList = this.dragState.placeholder.parentElement;
    if (!itemList) return;

    const itemElements = Array.from(itemList.children).filter(
      child => child !== this.dragState.placeholder && 
              child !== this.dragState.draggedElement &&
              child.classList.contains(this.config.itemSelector.replace('.', ''))
    ) as HTMLElement[];

    let insertIndex = itemElements.length;

    for (let i = 0; i < itemElements.length; i++) {
      const item = itemElements[i];
      const rect = item.getBoundingClientRect();
      const itemMiddle = rect.top + rect.height / 2;

      if (mouseY < itemMiddle) {
        insertIndex = i;
        break;
      }
    }

    // 移动占位符到正确位置
    if (insertIndex === 0) {
      itemList.insertBefore(this.dragState.placeholder, itemList.firstChild);
    } else if (insertIndex >= itemElements.length) {
      itemList.appendChild(this.dragState.placeholder);
    } else {
      itemList.insertBefore(this.dragState.placeholder, itemElements[insertIndex]);
    }
  }

  private async finishDrag() {
    if (!this.dragState.draggedElement || !this.dragState.draggedItemId || !this.dragState.placeholder) {
      this.resetDragState();
      return;
    }

    try {
      // 获取新的顺序
      const itemList = this.dragState.placeholder.parentElement;
      if (!itemList) {
        this.resetDragState();
        return;
      }

      // 计算新位置
      let newOrder = 0;
      for (let i = 0; i < itemList.children.length; i++) {
        const child = itemList.children[i];
        if (child === this.dragState.placeholder) {
          newOrder = i;
          break;
        }
      }

      // 将拖拽的元素移动到占位符的位置
      if (this.dragState.placeholder.nextSibling) {
        itemList.insertBefore(this.dragState.draggedElement, this.dragState.placeholder.nextSibling);
      } else {
        itemList.appendChild(this.dragState.draggedElement);
      }

      // 调用回调函数更新顺序
      await this.config.onOrderChange(this.dragState.draggedItemId, newOrder);

      // 调用完成回调
      if (this.config.onReorderComplete) {
        this.config.onReorderComplete(this.dragState.draggedItemId, newOrder);
      }

    } catch (error) {
      console.error('更新顺序失败:', error);
    } finally {
      this.resetDragState();
    }
  }

  private resetDragState() {
    if (this.dragState.draggedElement) {
      // 恢复拖拽元素样式
      this.dragState.draggedElement.style.opacity = '';
      this.dragState.draggedElement.style.transform = '';
      this.dragState.draggedElement.style.position = '';
      this.dragState.draggedElement.style.zIndex = '';
      this.dragState.draggedElement.style.width = '';
      this.dragState.draggedElement.style.top = '';
      this.dragState.draggedElement.style.left = '';
      this.dragState.draggedElement.style.pointerEvents = '';
      this.dragState.draggedElement.classList.remove('dragging');
    }

    // 移除占位符
    if (this.dragState.placeholder) {
      this.dragState.placeholder.remove();
    }

    // 重置状态
    this.dragState = {
      isDragging: false,
      draggedElement: null,
      draggedItemId: null,
      startY: 0,
      placeholder: null
    };
  }

  // 公共方法：销毁拖拽排序器
  public destroy() {
    this.resetDragState();
    // 可以在这里添加其他清理逻辑
  }
} 