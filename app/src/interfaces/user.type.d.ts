export interface User {
    uid: string,
    email: string,
    name:string,
    role: string,
    workshops?: string[]
}