import { HttpStatusCode } from "@angular/common/http";

export interface BasicApiResponse<AttributeInterface> {
  message: string;
  status: HttpStatusCode;
  data: AttributeInterface;
  selfLink: string;
  timestamp: Date;
}

export type Primitive = string | number | boolean | null | undefined;

export interface RequestOptions {
  params?: Record<string, Primitive | Primitive[]>;
  headers?: Record<string, Primitive>;
  withCredentials?: boolean;
  retryCount?: number;
}
