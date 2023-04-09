export default function authSwitchCase(authString: string) {
    switch (authString) {
        case 'Admin':
            return 4;
        case 'Manager':
            return 3;
        case 'Engineer':
            return 2;
        default:
            return 1;
    }
}