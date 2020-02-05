export function saveItem(item) {
    return fetch('/api/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
    }).then(response => response.json());
}

export function getItems() {
    return fetch('/api/items').then(response => response.json());
}
