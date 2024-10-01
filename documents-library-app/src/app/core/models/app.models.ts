export interface Document {
    id?: number;
    name?: string;
    description?: string;
    label?: string;
    status: string;
    createdAt?: string,
    favourite?: boolean
    details?: Object,
}