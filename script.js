const BASE_URL = "https://cwbnutrishop.oulrum.workers.dev/";

const sku = document.querySelector("div.codigo-produto span[itemprop='sku']").textContent;
const attributesContainer = document.querySelector(".atributos");
const attrComboboxes = Array.from(attributesContainer?.querySelectorAll(".wrapper-dropdown") || ['']);

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

    const data = await getFetch(`${BASE_URL}api/product?sku=${sku}`);

    const itemData = data['objects'][0];

    item.name = itemData.nome;
    item.url = itemData.url;
    item.sku = itemData.sku;
    item.active = itemData.ativo;
    item.variations = await getVariations(itemData.grades, itemData.filhos);

    for (let i = 0; i < attrComboboxes.length; i++) {
        items.push(item);
    }

    const kititem = document.createElement('template');
    kititem.id = '__KITDATA__';
    kititem.innerHTML = JSON.stringify(items);
    document.head.appendChild(kititem);

    const itemChoices = document.createElement('kit-choices');
    attributesContainer.appendChild(itemChoices);
}

addEventListener('load', () => {
    if (attributesContainer) {
        attributesContainer.innerHTML = '';     
        getChoices();
    }
});