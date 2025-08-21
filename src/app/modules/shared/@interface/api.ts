import { HttpStatusCode } from "@angular/common/http";

export interface BasicApiResponse<AttributeInterface> {
  message: string;
  status: HttpStatusCode;
  data: AttributeInterface;
  selfLink: string;
  timestamp: Date;
}
