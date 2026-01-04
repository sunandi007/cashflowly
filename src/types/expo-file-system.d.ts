declare module 'expo-file-system' {
    export interface FileSystemDownloadResult {
        uri: string;
        status: number;
        headers: Record<string, string>;
        md5?: string;
    }

    export interface FileSystemUploadOptions {
        headers?: Record<string, string>;
        httpMethod?: 'POST' | 'PUT' | 'PATCH';
        sessionType?: string;
        uploadType?: string;
        fieldName?: string;
        mimeType?: string;
        parameters?: Record<string, string>;
    }

    export interface FileSystemUploadResult {
        status: number;
        headers: Record<string, string>;
        body: string;
    }

    export interface EncodingType {
        UTF8: string;
        Base64: string;
    }

    export const EncodingType: EncodingType;

    export interface FileInfo {
        exists: boolean;
        isDirectory: boolean;
        uri: string;
        size?: number;
        modificationTime?: number;
        md5?: string;
    }

    export interface DownloadOptions {
        md5?: boolean;
        cache?: boolean;
        headers?: Record<string, string>;
        sessionType?: string;
    }

    export interface ReadingOptions {
        encoding?: 'utf8' | 'base64';
        position?: number;
        length?: number;
    }

    export interface WritingOptions {
        encoding?: 'utf8' | 'base64';
    }

    export interface DeletingOptions {
        idempotent?: boolean;
    }

    export interface ProgressData {
        totalByteSent: number;
        totalBytesExpectedToSend: number;
    }

    export type DownloadProgressCallback = (data: ProgressData) => void;

    export const documentDirectory: string | null;
    export const cacheDirectory: string | null;
    export const bundleDirectory: string | null;

    export function getInfoAsync(
        fileUri: string,
        options?: { md5?: boolean; size?: boolean }
    ): Promise<FileInfo>;

    export function readAsStringAsync(
        fileUri: string,
        options?: ReadingOptions
    ): Promise<string>;

    export function writeAsStringAsync(
        fileUri: string,
        contents: string,
        options?: WritingOptions
    ): Promise<void>;

    export function deleteAsync(
        fileUri: string,
        options?: DeletingOptions
    ): Promise<void>;

    export function moveAsync(options: {
        from: string;
        to: string;
    }): Promise<void>;

    export function copyAsync(options: {
        from: string;
        to: string;
    }): Promise<void>;

    export function makeDirectoryAsync(
        fileUri: string,
        options?: { intermediates?: boolean }
    ): Promise<void>;

    export function readDirectoryAsync(fileUri: string): Promise<string[]>;

    export function downloadAsync(
        uri: string,
        fileUri: string,
        options?: DownloadOptions
    ): Promise<FileSystemDownloadResult>;

    export function uploadAsync(
        url: string,
        fileUri: string,
        options?: FileSystemUploadOptions
    ): Promise<FileSystemUploadResult>;

    export function createDownloadResumable(
        uri: string,
        fileUri: string,
        options?: DownloadOptions,
        callback?: DownloadProgressCallback,
        resumeData?: string
    ): DownloadResumable;

    export class DownloadResumable {
        constructor(
            url: string,
            fileUri: string,
            options?: DownloadOptions,
            callback?: DownloadProgressCallback,
            resumeData?: string
        );

        downloadAsync(): Promise<FileSystemDownloadResult | undefined>;
        pauseAsync(): Promise<string>;
        resumeAsync(): Promise<FileSystemDownloadResult | undefined>;
        savable(): string;
    }
}
