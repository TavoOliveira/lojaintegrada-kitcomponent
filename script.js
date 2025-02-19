const BASE_URL = "https://cwbnutrishop.oulrum.workers.dev/";

const sku = document.querySelector("div.codigo-produto span[itemprop='sku']").textContent;
const skuReference = document.querySelector("#descricao [ref]").textContent;
const attributesContainer = document.querySelector(".atributos");
const attrComboboxes = attributesContainer?.querySelectorAll(".wrapper-dropdown").length > 0 ? attributesContainer?.querySelectorAll(".wrapper-dropdown") : attributesContainer?.querySelectorAll("ul");
const btnsBuy = document.querySelectorAll(".botao-comprar");
let kitChoices;

const item = {};

async function getFetch(path) {
    const response = await fetch(path);
    const data = await response.json();
    return data;
}

async function getStock(id) {
    const apiUrl = `${BASE_URL}api/stock?id=${id}`;
    const data = await getFetch(apiUrl);
    return data.quantidade;
}

async function getVariations(grades, children) {
    const variationsData = [];
    const variations = [];
    item.grades = [];

    const gradeId = grades[0].split('/')[4];
    item.grades.push(gradeId);

    const gradeData = await getFetch(`${BASE_URL}api/grades?id=${gradeId}`);

    for (let child of children) {
        const childId = child.split('/')[4];
        const childData = await getFetch(`${BASE_URL}api/product?id=${childId}`);
        variationsData.push({
            resource_uri: childData['variacoes'][0],
            id: childId,
            active: childData['ativo']
        });
    }

    const variationsFiltered = gradeData['variacoes'].filter(variation => {
        return variationsData.some(data => data.resource_uri === variation.resource_uri);
    });

    for (let variation of variationsFiltered) {
        const variationDataFiltered = variationsData.filter(data => data.resource_uri === variation.resource_uri)[0];
        const stock = await getStock(variationDataFiltered.id);
        variations.push({
            id: variationDataFiltered.id,
            id_grade: gradeId,
            name: variation.nome,
            active: variationDataFiltered.active,
            stock: stock
        });
    }

    return variations;
}

async function getChoices() {
    const items = [];
    const data = await getFetch(`${BASE_URL}api/product?sku=${skuReference}`);

    if (!data.objects || data.objects.length === 0) {
        console.error('Produto não encontrado.');
        return;
    }

    const itemData = data.objects[0];
    const item = {
        name: itemData.nome,
        url: itemData.url,
        sku: itemData.sku,
        active: itemData.ativo,
        variations: await getVariations(itemData.grades || [], itemData.filhos || []),
    };

    for (let i = 0; i < attrComboboxes.length; i++) {
        items.push(item);
    }

    const kititem = document.createElement('template');
    kititem.id = '__KITDATA__';
    kititem.innerHTML = JSON.stringify(items);
    document.head.appendChild(kititem);

    kitChoices = document.createElement('kit-choices');
    attributesContainer.innerHTML = '';
    attributesContainer.appendChild(kitChoices);
}

function arrayToUrlParams(array, quantity = 1) {
    return array.map(item => {
        return `${item}=${quantity}`;
    }).join('&');
}

function validateValues() {
    const inputQuantity = document.querySelector("input[name='qtde-carrinho'");

    if (kitChoices.itemsSelected.length != attrComboboxes.length) return;

    var cartKitList = JSON.parse(sessionStorage.getItem('carrinho-kits'));
    cartKitList.push(kitChoices.itemsSelected);
    sessionStorage.setItem('carrinho-kits', JSON.stringify(cartKitList));

    btnsBuy.forEach(btn => {
        btn.classList.remove('desativo');
        btn.href = `https://www.cwbnutrishop.com/carrinho/produto/adicionar?${arrayToUrlParams(kitChoices.itemsSelected, inputQuantity.value)}`;
    });
}

async function startKitComponent() {
    if (attributesContainer && sku.includes('KIT')) {
        sessionStorage.setItem('carrinho-kits', '[]');

        attributesContainer.innerHTML = `
            <div class="loading-variation-kit"></div>
        `;

        btnsBuy.forEach(btn => {
            btn.href = 'javascript:void(0)';
        });

        await getChoices();

        kitChoices.addEventListener('change', validateValues);
    }
}

window.addEventListener('load', async () => { await startKitComponent(); });