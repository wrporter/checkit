import { getUser } from '../../services/UserService';

export function bootstrapAppData() {
    return getUser().then(data => {
        if (!data) {
            return { user: null };
        }
        return { user: data };
    });
}
