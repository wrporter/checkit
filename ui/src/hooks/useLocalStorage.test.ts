import { act, renderHook } from '@testing-library/react-hooks';
import useLocalStorage from './useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts as undefined when no default is provided', () => {
        const { result } = renderHook(() => useLocalStorage('item'));
        expect(result.current[0]).toBeUndefined();
    });

    it('starts with a default value', () => {
        const { result } = renderHook(() => useLocalStorage('item', 'default'));
        expect(result.current[0]).toEqual('default');
    });

    it('sets new values in storage', () => {
        const { result } = renderHook(() => useLocalStorage('item'));
        act(() => {
            result.current[1]({ a: 1 });
        });
        expect(result.current[0]).toEqual({ a: 1 });
    });

    it('returns already saved strings from the store', () => {
        localStorage.setItem('item', 'value');
        const { result } = renderHook(() => useLocalStorage('item'));
        expect(result.current[0]).toEqual('value');
    });

    it('returns already saved objects from the store', () => {
        localStorage.setItem('item', JSON.stringify({ a: 1 }));
        const { result } = renderHook(() => useLocalStorage('item'));
        expect(result.current[0]).toEqual({ a: 1 });
    });
});
