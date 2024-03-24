export interface IUser {
    email: string;
    password: string;
}

export interface ILogin extends IUser {
    isRemember?: boolean;
}

export interface IRegister extends IUser {
    fullName: string;
    confirmPassword: string;
    role: TROLE;
}

export interface IProfile extends IUser {
    fullName: string;
    gender?: TGENDER;
    profile_image?: string;
    age?: number;
    role: TROLE;
    createdAt?: string;
    updatedAt?: string;
}

export type TGENDER = "MALE" | "FEMALE" | "NOT_SPECIED";
export type TROLE = "ADMIN" | "USER" | "PREMIUM"