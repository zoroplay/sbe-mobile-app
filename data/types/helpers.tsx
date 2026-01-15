import { localImages, remoteImages } from "../../assets/images";

export type LocalImageKey = keyof typeof localImages;
export type RemoteImageKey = keyof typeof remoteImages;
export type ImageKey = LocalImageKey | RemoteImageKey;
