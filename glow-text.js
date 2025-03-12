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

  render() {
    // Get attribute values with fallbacks
    const text = this.getAttribute('text') || 'Glow Text';
    const textColor = this.getAttribute('text-color') || '#FFD700'; // Gold
    const backgroundColor = this.getAttribute('background-color') || 'linear-gradient(135deg, #2E1A47 0%, #4B2E83 100%)'; // Purple gradient
    const fontFamily = this.getAttribute('font-family') || 'Montserrat';
    const fontSize = this.getAttribute('font-size') || '5'; // In vw
    const textAlignment = this.getAttribute('text-alignment') || 'center';

    // Spanize the text (wrap each letter in a span)
    const spanizedText = text.split('').map(char => `<span>${char}</span>`).join('');

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
          font-size: ${fontSize}vw;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${textColor};
        }

        .glow-container span {
          display: inline-block;
          animation: letter-glow 0.7s ease both;
        }

        /* Apply animation delay to each letter */
        .glow-container span:nth-child(n) {
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
      <div class="glow-container">${spanizedText}</div>
    `;

    // Set custom property for animation delay
    const spans = this.shadowRoot.querySelectorAll('.glow-container span');
    spans.forEach((span, index) => {
      span.style.setProperty('--letter-index', index);
    });
  }
}

// Define the custom element
customElements.define('glow-text', GlowText);
