interface ShortcutConfig {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  action: string;
  description: string;
}

interface ButtonSelector {
  selector: string;
  description: string;
}

interface ActionConfig {
  selectors: ButtonSelector[];
  fallbackSearch?: {
    element: string;
    textContent: string;
  };
}

const SAFE_SHORTCUTS_IN_INPUTS = ['clickCreateField'];

const SHORTCUTS_CONFIG: ShortcutConfig[] = [
  {
    key: "f",
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    action: "openFieldVisibilityMenu",
    description: "Open field visibility menu",
  },
  {
    key: "h",
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    action: "clickHideAll",
    description: "Hide all fields (visibility menu)",
  },
  {
    key: "n",
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    action: "clickAddField",
    description: "Add a field",
  },
  {
    key: "s",
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: true,
    action: "clickCreateField",
    description: "Save field",
  },
  {
    key: ".",
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: true,
    action: "showShortcutsPopup",
    description: "Show shortcuts popup",
  },
];

const ACTIONS_CONFIG: Record<string, ActionConfig> = {
  openFieldVisibilityMenu: {
    selectors: [
      {
        selector: '[data-testid="hide-fields-button"]',
        description: "Hide fields button",
      },
      {
        selector: '[data-testid="show-hide-fields-button"]',
        description: "Show/hide fields button",
      },
      {
        selector: '[data-testid="field-visibility-button"]',
        description: "Field visibility button",
      },
      {
        selector: '[aria-label*="field"][aria-label*="hide" i]',
        description: "Field hide button (aria-label)",
      },
      {
        selector: '[aria-label*="field"][aria-label*="show" i]',
        description: "Field show button (aria-label)",
      },
      {
        selector: '[aria-label*="column"][aria-label*="hide" i]',
        description: "Column hide button (aria-label)",
      },
      {
        selector: 'button[title*="field" i]',
        description: "Field button (title)",
      },
      {
        selector: 'button[title*="column" i]',
        description: "Column button (title)",
      },
      {
        selector: '[data-testid*="field"] button',
        description: "Field-related button",
      },
      {
        selector: '[data-testid*="column"] button',
        description: "Column-related button",
      },
      {
        selector: 'button svg[data-testid*="eye"]',
        description: "Eye icon button",
      },
      {
        selector: 'button[aria-label*="visible" i]',
        description: "Visibility button (aria-label)",
      },
    ],
  },
  clickHideAll: {
    selectors: [],
    fallbackSearch: {
      element: 'div[role="button"]',
      textContent: "Hide all",
    },
  },
  clickAddField: {
    selectors: [
      {
        selector: ".gridHeaderRowAddFieldButton",
        description: "Grid header add field button",
      },
      {
        selector: '[data-tutorial-selector-id="gridHeaderAddFieldButton"]',
        description: "Add field button (tutorial)",
      },
      {
        selector: '[aria-label="add a field"]',
        description: "Add field button (aria-label)",
      },
      {
        selector: '[title="Add field"]',
        description: "Add field button (title)",
      },
    ],
  },
  clickCreateField: {
    selectors: [
      {
        selector: '[data-tutorial-selector-id="columnDialogCreateButton"]',
        description: "Create field button (tutorial)",
      },
      {
        selector: '[data-testid="column-dialog-create-button"]',
        description: "Create field button (testid)",
      },
      {
        selector: 'button:has(.button-text-label:contains("Create field"))',
        description: "Create field button (has text)",
      },
      {
        selector: "button .button-text-label",
        description: "Button text label",
      },
    ],
    fallbackSearch: {
      element: "button",
      textContent: "Create field",
    },
  },
  showShortcutsPopup: {
    selectors: [],
  },
};

class ShortcutManager {
  private shortcuts: Map<string, ShortcutConfig> = new Map();

  constructor() {
    this.registerShortcuts();
  }

  private registerShortcuts(): void {
    SHORTCUTS_CONFIG.forEach((config) => {
      const shortcutKey = this.buildShortcutKey(config);
      this.shortcuts.set(shortcutKey, config);
    });
  }

  private buildShortcutKey(config: ShortcutConfig): string {
    const parts: string[] = [];
    if (config.ctrlKey) parts.push("ctrl");
    if (config.shiftKey) parts.push("shift");
    if (config.altKey) parts.push("alt");
    if (config.metaKey) parts.push("meta");
    parts.push(config.key.toLowerCase());
    return parts.join("+");
  }

  handleKeyDown(e: KeyboardEvent): string | null {
    const shortcutKey = this.getShortcutKey(e);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut && this.matchesShortcut(e, shortcut)) {
      if (this.isInputFocused(e.target as Element)) {
        // Allow safe shortcuts to work even when focus is on inputs
        if (!SAFE_SHORTCUTS_IN_INPUTS.includes(shortcut.action)) {
          return null;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      console.log(`🎯 Triggering shortcut: ${shortcut.description}`);
      return shortcut.action;
    }

    return null;
  }

  private getShortcutKey(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey) parts.push("ctrl");
    if (e.shiftKey) parts.push("shift");
    if (e.altKey) parts.push("alt");
    if (e.metaKey) parts.push("meta");
    parts.push(e.key.toLowerCase());
    return parts.join("+");
  }

  private matchesShortcut(e: KeyboardEvent, shortcut: ShortcutConfig): boolean {
    return (
      e.key.toLowerCase() === shortcut.key &&
      e.shiftKey === shortcut.shiftKey &&
      e.ctrlKey === shortcut.ctrlKey &&
      e.altKey === shortcut.altKey &&
      e.metaKey === shortcut.metaKey
    );
  }

  private isInputFocused(target: Element | null): boolean {
    if (!target) return false;

    const tagName = target.tagName.toLowerCase();
    const isInput = tagName === "input" || tagName === "textarea";
    const isContentEditable = target.getAttribute("contenteditable") === "true";
    const isInEditableDiv = target.closest('[contenteditable="true"]') !== null;

    return isInput || isContentEditable || isInEditableDiv;
  }
}

class ShortcutsPopup {
  private popup: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;

  show(): void {
    if (this.popup) {
      this.hide();
    }

    this.createPopup();
    this.bindEvents();
  }

  hide(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
  }

  private createPopup(): void {
    this.backdrop = document.createElement("div");
    this.backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    this.popup = document.createElement("div");
    this.popup.style.cssText = `
      background: #1f2937;
      color: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      font-family: system-ui, -apple-system, sans-serif;
      position: relative;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #374151;
    `;

    const title = document.createElement("h2");
    title.textContent = "Keyboard Shortcuts";
    title.style.cssText = `
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #f9fafb;
    `;

    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.background = "#374151";
      closeButton.style.color = "#f9fafb";
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = "none";
      closeButton.style.color = "#9ca3af";
    };
    closeButton.onclick = () => this.hide();

    header.appendChild(title);
    header.appendChild(closeButton);

    const shortcutsList = document.createElement("div");
    shortcutsList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    SHORTCUTS_CONFIG.forEach((shortcut) => {
      const shortcutItem = document.createElement("div");
      shortcutItem.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
      `;

      const description = document.createElement("span");
      description.textContent = shortcut.description;
      description.style.cssText = `
        color: #e5e7eb;
        font-size: 14px;
      `;

      const keyCombo = document.createElement("span");
      keyCombo.textContent = this.formatKeyCombo(shortcut);
      keyCombo.style.cssText = `
        background: #374151;
        color: #f9fafb;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      `;

      shortcutItem.appendChild(description);
      shortcutItem.appendChild(keyCombo);
      shortcutsList.appendChild(shortcutItem);
    });

    this.popup.appendChild(header);
    this.popup.appendChild(shortcutsList);
    this.backdrop.appendChild(this.popup);
    document.body.appendChild(this.backdrop);
  }

  private formatKeyCombo(shortcut: ShortcutConfig): string {
    const parts: string[] = [];
    if (shortcut.metaKey) parts.push("⌘");
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.shiftKey) parts.push("⇧");
    if (shortcut.altKey) parts.push("⌥");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  }

  private bindEvents(): void {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    if (this.backdrop) {
      this.backdrop.addEventListener("click", (e) => {
        if (e.target === this.backdrop) {
          this.hide();
        }
      });
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.hide();
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

class ActionExecutor {
  private shortcutsPopup: ShortcutsPopup;

  constructor() {
    this.shortcutsPopup = new ShortcutsPopup();
  }

  executeAction(actionName: string): void {
    if (actionName === "showShortcutsPopup") {
      this.shortcutsPopup.show();
      return;
    }

    const actionConfig = ACTIONS_CONFIG[actionName];
    if (!actionConfig) {
      console.warn(`⚠️ Unknown action: ${actionName}`);
      return;
    }

    const button = this.findButton(actionConfig);
    if (button) {
      console.log(`🎯 Executing action: ${actionName}`);
      this.clickElementWithFocus(button);
    } else {
      console.warn(`⚠️ Button not found for action: ${actionName}`);
      this.showNotification(`${actionName} button not found`);
    }
  }

  private clickElementWithFocus(element: HTMLElement): void {
    try {
      // Handle Monaco Editor specifically
      const monacoEditor = document.querySelector(".monaco-editor");
      if (monacoEditor && document.activeElement) {
        // Check if focus is within Monaco editor
        const isMonacoFocused = monacoEditor.contains(document.activeElement);
        if (isMonacoFocused) {
          // For Monaco, we need to blur the textarea specifically
          const monacoTextarea = monacoEditor.querySelector(
            "textarea.inputarea"
          ) as HTMLTextAreaElement;
          if (monacoTextarea) {
            monacoTextarea.blur();
          }
        }
      }

      // Blur any currently focused element to prevent interference
      if (document.activeElement && document.activeElement !== element) {
        (document.activeElement as HTMLElement).blur();
      }

      // Small delay to ensure focus has been properly released
      setTimeout(() => {
        // Focus the target element first
        element.focus();

        // Click the element
        element.click();
      }, 10);
    } catch (error) {
      console.warn("⚠️ Error during focus management:", error);
      // Fallback to direct click if focus management fails
      element.click();
    }
  }

  private findButton(config: ActionConfig): HTMLElement | null {
    for (const { selector, description } of config.selectors) {
      const button = document.querySelector(selector) as HTMLElement;
      if (button && this.isElementVisible(button)) {
        console.log(`🎯 Found button: ${description}`);
        return button;
      }
    }

    if (config.fallbackSearch) {
      const buttons = Array.from(
        document.querySelectorAll(config.fallbackSearch.element)
      );
      for (const button of buttons) {
        if (
          button.textContent?.trim() === config.fallbackSearch.textContent &&
          this.isElementVisible(button as HTMLElement)
        ) {
          console.log(
            `🎯 Found button via fallback: ${config.fallbackSearch.textContent}`
          );
          return button as HTMLElement;
        }
      }
    }

    return null;
  }

  private isElementVisible(element: HTMLElement): boolean {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  private showNotification(message: string): void {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border-left: 4px solid #3b82f6;
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

class AirtableShortcuts {
  private isInitialized: boolean = false;
  private shortcutManager: ShortcutManager;
  private actionExecutor: ActionExecutor;

  constructor() {
    this.shortcutManager = new ShortcutManager();
    this.actionExecutor = new ActionExecutor();
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized) return;

    console.log("🚀 Airtable Shortcuts extension loaded");
    this.bindKeyboardEvents();
    this.isInitialized = true;
  }

  private bindKeyboardEvents(): void {
    document.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        const actionName = this.shortcutManager.handleKeyDown(e);
        if (actionName) {
          this.actionExecutor.executeAction(actionName);
        }
      },
      true
    );
  }
}

// Initialize the extension when the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new AirtableShortcuts();
  });
} else {
  new AirtableShortcuts();
}

// Handle navigation in single-page applications (SPAs)
let currentUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    console.log("🔄 Page navigation detected, reinitializing shortcuts");

    // Small delay to let the new page load
    setTimeout(() => {
      new AirtableShortcuts();
    }, 1000);
  }
});

// Watch for DOM changes to detect navigation
observer.observe(document, { subtree: true, childList: true });
