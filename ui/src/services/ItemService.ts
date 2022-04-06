export interface Item {
    id: string;
    text: string;
    dateCompleted?: string;
}

export interface SaveItem {
    text: string;
}

export async function saveItem(item: SaveItem) {
    const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
    });
    if (response.status >= 400) {
        return Promise.reject(
            new Error('Failed to save item. Please try again.')
        );
    }
    return response.json();
}

export async function updateItemStatus(itemId: string, status: string) {
    const response = await fetch(`/api/items/${itemId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    if (response.status >= 400) {
        return Promise.reject(
            new Error('Failed to update item status. Please try again.')
        );
    }
    return response;
}

export async function getItems() {
    const response = await fetch('/api/items');
    return response.json();
}

export function deleteCompletedItems() {
    return fetch('/api/items/completed', {
        method: 'DELETE',
    });
}
