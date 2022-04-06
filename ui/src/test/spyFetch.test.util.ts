export default function spyFetch(status: number, response?: any) {
    // @ts-ignore
    jest.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve({
            json: () => Promise.resolve(response),
            status,
        })
    );
}
