export function saveItem(item) {
    return fetch('/api/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
    })
        .then(response => {
            if (response.status >= 400) {
                throw new Error('Failed to save item. Please try again.');
            }
            return response;
        })
        .then(response => response.json());
}

export function updateItemStatus(itemId, status) {
    return fetch(`/api/items/${itemId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    }).then(response => {
        if (response.status >= 400) {
            throw new Error('Failed to update item status. Please try again.');
        }
        return response;
    });
}

export function getItems() {
    return fetch('/api/items').then(response => response.json());
}

export function deleteCompletedItems() {
    return fetch('/api/items/completed', {
        method: 'DELETE',
    });
}
