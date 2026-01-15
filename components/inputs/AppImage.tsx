import { ImageKey } from "@/data/types/helpers";
import { AppHelper } from "@/utils/helper";
import React from "react";
import { Image, ImageProps, ImageURISource, View } from "react-native";

interface AppImageProps extends Omit<ImageProps, "source"> {
  imageKey: ImageKey;
  fallbackSource?: ImageURISource;
}

export const AppImage: React.FC<AppImageProps> = ({
  imageKey,
  fallbackSource,
  ...props
}) => {
  const imageSource = AppHelper.getImageSource(imageKey);

  return (
    <Image source={imageSource} defaultSource={fallbackSource} {...props} />
  );
};

// Convenience components for common use cases
export const LocalImage: React.FC<
  Omit<AppImageProps, "imageKey"> & {
    imageKey: keyof typeof import("@/assets/images").localImages;
  }
> = (props) => {
  return <AppImage {...props} />;
};

export const RemoteImage: React.FC<
  Omit<AppImageProps, "imageKey"> & {
    imageKey: keyof typeof import("@/assets/images").remoteImages;
  }
> = (props) => {
  return <AppImage {...props} />;
};

export default AppImage;
