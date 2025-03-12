class GlowText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['text', 'text-color', 'background-color', 'font-family', 'font-size', 'text-alignment'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  // Basic HTML sanitizer (whitelist allowed tags)
  sanitizeHTML(html) {
    const allowedTags = ['strong', 'em', 'b', 'i', 'u', 'span'];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const tagName = node.tagName.toLowerCase();
        if (allowedTags.includes(tagName)) {
          while (node.attributes.length > 0) {
            node.removeAttribute(node.attributes[0].name);
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    });

    while (walker.nextNode()) {}
    return tempDiv.innerHTML;
  }

  // Spanize text nodes for animation without gaps
  spanizeTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        const spanContainer = document.createElement('span');
        spanContainer.className = 'letter-group';
        const spanized = text.split('').map(char => `<span class="letter">${char}</span>`).join('');
        spanContainer.innerHTML = spanized;
        node.parentNode.replaceChild(spanContainer, node);
        return spanContainer;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(child => this.spanizeTextNodes(child));
    }
    return node;
  }

  render() {
    // Get attribute values with fallbacks
    const rawText = this.getAttribute('text') || 'Glow Text';
    const textColor = this.getAttribute('text-color') || '#FFD700';
    const backgroundColor = this.getAttribute('background-color') || 'linear-gradient(135deg, #2E1A47 0%, #4B2E83 100%)';
    const fontFamily = this.getAttribute('font-family') || 'Montserrat';
    const fontSize = this.getAttribute('font-size') || '40'; // In px
    const textAlignment = this.getAttribute('text-alignment') || 'center';

    // Sanitize the HTML input
    const sanitizedHTML = this.sanitizeHTML(rawText);

    // Create a temporary container to process the HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = sanitizedHTML;

    // Spanize text nodes for animation
    this.spanizeTextNodes(tempContainer);

    // Inject HTML and CSS into shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: ${backgroundColor};
          overflow: hidden;
        }

        .glow-container {
          text-align: ${textAlignment};
          padding: 5%;
          max-width: 90%;
          font-family: ${fontFamily}, sans-serif;
          font-size: ${fontSize}px;
          color: ${textColor};
          /* Removed letter-spacing and other font overrides to let Wix defaults apply */
        }

        .letter-group {
          display: inline; /* Ensure no gaps between groups */
        }

        .letter {
          display: inline; /* Remove inline-block gaps */
          animation: letter-glow 0.7s ease both;
          margin: 0;
          padding: 0;
        }

        /* Apply animation delay to each letter */
        .letter:nth-child(n) {
          animation-delay: calc(0.05s * var(--letter-index));
        }

        @keyframes letter-glow {
          0% {
            opacity: 0;
            text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
          }
          66% {
            opacity: 1;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.9);
          }
          77% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0);
          }
        }
      </style>
      <div class="glow-container">${tempContainer.innerHTML}</div>
    `;

    // Set custom property for animation delay
    const letters = this.shadowRoot.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
      letter.style.setProperty('--letter-index', index);
    });
  }
}

// Define the custom element
customElements.define('glow-text', GlowText);
