declare module 'tesseract.js' {
  export interface Worker {
    recognize(
      image: string | HTMLImageElement | HTMLCanvasElement,
      options?: any,
      config?: {
        logger?: (info: {
          status: string;
          progress: number;
          [key: string]: any;
        }) => void;
      }
    ): Promise<{
      data: {
        text: string;
        confidence: number;
        [key: string]: any;
      };
    }>;
    terminate(): Promise<void>;
  }

  export function createWorker(lang?: string | string[]): Promise<Worker>;
}

declare namespace Tesseract {
  interface Worker {
    recognize(
      image: string | HTMLImageElement | HTMLCanvasElement,
      options?: any,
      config?: {
        logger?: (info: {
          status: string;
          progress: number;
          [key: string]: any;
        }) => void;
      }
    ): Promise<{
      data: {
        text: string;
        confidence: number;
        [key: string]: any;
      };
    }>;
    terminate(): Promise<void>;
  }
}

