import React from 'react';
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import Controls from './Controls';
import { deleteCompletedItems } from '../../services/ItemService';

jest.mock('../../services/ItemService');

describe('Controls', () => {
    it('renders controls', () => {
        render(
            <Controls
                showCompleted={false}
                onShowCompletedChange={() => {}}
                onDeleteCompleted={() => {}}
            />
        );

        expect(screen.getByLabelText('Controls')).toBeInTheDocument();
    });

    it('fires onShowCompletedChange', () => {
        const onShowCompletedChange = jest.fn();
        const { rerender } = render(
            <Controls
                showCompleted={false}
                onShowCompletedChange={onShowCompletedChange}
                onDeleteCompleted={() => {}}
            />
        );

        fireEvent.click(screen.getByLabelText('Controls'));
        fireEvent.click(screen.getByTitle('Show Completed Items'));

        expect(onShowCompletedChange).toHaveBeenCalledWith(true);

        rerender(
            <Controls
                showCompleted
                onShowCompletedChange={onShowCompletedChange}
                onDeleteCompleted={() => {}}
            />
        );

        fireEvent.click(screen.getByLabelText('Controls'));
        fireEvent.click(screen.getByTitle('Hide Completed Items'));

        expect(onShowCompletedChange).toHaveBeenCalledWith(false);
    });

    it('fires onDeleteCompleted', async () => {
        (deleteCompletedItems as jest.Mock).mockResolvedValue({ status: 200 });
        const onDeleteCompleted = jest.fn();
        render(
            <Controls
                showCompleted={false}
                onShowCompletedChange={() => {}}
                onDeleteCompleted={onDeleteCompleted}
            />
        );

        fireEvent.click(screen.getByLabelText('Controls'));
        fireEvent.click(screen.getByTitle('Delete Completed Items'));

        await waitFor(() => {
            expect(onDeleteCompleted).toHaveBeenCalled();
        });
    });

    it('displays an error when failing to delete completed items', async () => {
        jest.useFakeTimers();

        (deleteCompletedItems as jest.Mock).mockResolvedValue({ status: 500 });
        const onDeleteCompleted = jest.fn();
        render(
            <Controls
                showCompleted={false}
                onShowCompletedChange={() => {}}
                onDeleteCompleted={onDeleteCompleted}
            />
        );

        fireEvent.click(screen.getByLabelText('Controls'));
        fireEvent.click(screen.getByTitle('Delete Completed Items'));

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Failed to delete completed items. Please try again.'
                )
            ).toBeInTheDocument();
        });
        expect(onDeleteCompleted).not.toHaveBeenCalled();

        act(() => {
            jest.runAllTimers();
        });
        expect(
            screen.queryByText(
                'Failed to delete completed items. Please try again.'
            )
        ).not.toBeInTheDocument();
    });
});
