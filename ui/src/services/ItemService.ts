export interface Item {
    id: string;
    text: string;
    dateCompleted?: string;
}

export interface SaveItem {
    text: string;
}

export function saveItem(item: SaveItem) {
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

export function updateItemStatus(itemId: string, status: string) {
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
