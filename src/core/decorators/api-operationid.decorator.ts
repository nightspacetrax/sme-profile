import { SetMetadata } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

export const ApiOperationid = (options?: {
  title?: string;
  description?: string;
  operationId?: string;
  deprecated?: boolean;
}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const controllerName = target.constructor.name;
    const metadata = options
      ? { ...options, title: options.title || propertyKey }
      : { title: propertyKey };
    ApiOperation({
      ...metadata,
      summary: metadata.title,
      operationId: `${controllerName.substr(
        0,
        controllerName.indexOf("Controller"),
      )}_${metadata.title}`,
    })(target, propertyKey, descriptor);
  };
};
