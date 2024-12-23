class KitChoices extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const KITDATA = document.querySelector('template#__KITDATA__');
        this.items = JSON.parse(KITDATA.innerHTML);

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(this.style());
        shadow.appendChild(this.render());
    }

    getItemChoices(variations) {
        const idRadio = Math.random().toString(36).substring(2, 2 + 5);

        const itemChoicesContainer = document.createElement('div');
        itemChoicesContainer.classList.add("kit-item-choices");
        itemChoicesContainer.innerHTML += "<div style='margin-top: 5px;'><strong>sabor:</strong></div>";

        const variationsList = document.createElement('div');
        variationsList.classList.add("variations-container");

        for (let variation of variations) {
            if (!variation.active) continue;

            const idRadioFormated = `${variation.name}-${idRadio}`;
            const label = document.createElement('label');
            label.innerText = variation.name;
            label.setAttribute("for", idRadioFormated);
            const radio = document.createElement('input');
            radio.type = "radio";
            radio.id = idRadioFormated
            radio.name = `radio-variation-${idRadio}`;
            radio.style.display = 'none';
            variationsList.append(radio, label);

            if (variation.stock <= 0) {
                label.classList.add("disabled");
                radio.disabled = true;
            }
        }

        itemChoicesContainer.append(variationsList);
        return itemChoicesContainer;
    }

    getItemInfo(item) {
        const itemInfo = document.createElement('div');
        itemInfo.classList.add("kit-item-info");

        const itemAnchor = document.createElement('a');
        itemAnchor.href = item.url; // Aqui você pode usar o SKU para definir um link dinâmico
        itemAnchor.innerText = item.name;

        const itemRef = document.createElement('small');
        itemRef.innerText = `Ref: ${item.sku}`;

        itemInfo.append(
            itemAnchor,
            itemRef,
            this.getItemChoices(item.variations)
        );

        return itemInfo;
    }

    render() {
        const container = document.createElement('div');
        container.classList.add('kit-choices-container');
        
        const title = document.createElement('p');
        title.classList.add("title");
        title.innerText = "Produtos do Kit";

        container.appendChild(title);

        this.items.forEach(item => {
            const itemContainer = document.createElement('div');
            itemContainer.classList.add("item-container");
            
            const itemInfo = this.getItemInfo(item);
            const itemQuantity = document.createElement('div');
            itemQuantity.classList.add("kit-unit");
            itemQuantity.innerText = "1 unidade";

            itemContainer.append(itemInfo, itemQuantity);
            container.appendChild(itemContainer);
        });

        return container;
    }

    style() {
        const style = document.createElement('style');
        style.textContent = `
            .kit-choices-container {
                border: 1px solid gray;
                border-radius: 10px;
            }
            .title {
                text-align: center;
                color: #C30B02;
                font-weight: bold;
            }
            .item-container {
                display: flex;   
                border-top: 1px solid gray;
                padding: 10px; 
            }
            .kit-item-info {
                flex-grow: 1;
            }
            .kit-unit {
                width: 150px;
            }
            .kit-item-info a {
                display: block;
            }
            .variations-container {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
            }
            .variations-container label {
                border: 1px solid gray;
                padding: 2px 5px;
                border-radius: 5px;
                cursor: pointer;
                background-color: white;
                transition: all .5s;
            }
            .variations-container label:not(.disabled):hover {
                transform: scale(1.05);
            }
            .variations-container input:checked + label {
                background-color: #C30B02;
                color: white;
                font-weight: bold;
                border: none;
            }
            .variations-container label.disabled {
                background-color: gray;
                color: rgba(255, 255, 255, 0.2);
                cursor: not-allowed;
                position: relative;
            }
            .variations-container label.disabled:before {
                content: 'FALTA';
                color: red;
                font-size: 12px;
                position: absolute;
                font-weight: bold;
                top: -5%;
                left: 50%;
                transform: rotate(-35deg) translate(-50%, -50%);
            }
        `;

        return style;
    }
}

customElements.define('kit-choices', KitChoices);