import {
    deleteCompletedItems,
    getItems,
    saveItem,
    updateItemStatus,
} from './ItemService';
import spyFetch from '../test/spyFetch.test.util';

describe('ItemService', () => {
    describe('saveItem', () => {
        it('succeeds', async () => {
            const response = { id: 123 };
            spyFetch(200, response);

            await expect(saveItem({ text: 'abc' })).resolves.toEqual(response);
        });

        it('throws an error for bad status codes', async () => {
            spyFetch(400);

            await expect(saveItem({ text: 'abc' })).rejects.toThrow();
        });
    });

    describe('updateItemStatus', () => {
        it('succeeds', async () => {
            spyFetch(200);

            await expect(
                updateItemStatus('id1', 'complete')
            ).resolves.toBeDefined();
        });

        it('throws an error for bad status codes', async () => {
            spyFetch(400);

            await expect(updateItemStatus('id1', 'complete')).rejects.toThrow();
        });
    });

    describe('getItems', () => {
        it('succeeds', async () => {
            const response = { items: 123 };
            spyFetch(200, response);

            await expect(getItems()).resolves.toEqual(response);
        });
    });

    describe('deleteCompletedItems', () => {
        it('succeeds', async () => {
            spyFetch(200);

            await expect(deleteCompletedItems()).resolves.toBeDefined();
        });
    });
});
