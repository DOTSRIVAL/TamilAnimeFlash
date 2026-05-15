import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { setMetadataKeys } from '../services/metadataService';

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  telegram?: string;
  discord?: string;
  gmail?: string;
}

export interface ApiKeyRecord {
  id: string;
  provider: string;
  key: string;
  category?: string;
}

export interface WebsiteConfig {
  name: string;
  logoUrl?: string;
  socials?: SocialLinks;
  copyrightText?: string;
  providerText?: string;
  providerName?: string;
  developerName?: string;
  apiKeys?: ApiKeyRecord[];
  avatarCollections?: Record<string, string[]>;
}

const DEFAULT_CONFIG: WebsiteConfig = {
  name: 'Tamil Anime Flash',
  socials: {},
  copyrightText: 'Copyright © {name}. All Rights Reserved',
  providerText: 'Third-party provided content. No files stored locally.',
  providerName: 'Tamil Anime Flash',
  developerName: 'DOTSRIVAL',
  apiKeys: [],
  avatarCollections: {
    "Bleach": [
      "https://wsrv.nl/?url=i.pinimg.com/736x/82/ac/5c/82ac5c26bdf69a68de629f57ebbf7fc7.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/60/76/89/607689dca3e5272a2f8bdf9b3e18a931.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/ec/d7/20/ecd720eeea62c2fbeaaf1c5ac662e737.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/a4/09/bd/a409bd1bbddb51f0fcd6fd6f890cf282.jpg"
    ],
    "Naruto": [
      "https://wsrv.nl/?url=i.pinimg.com/736x/8f/a0/02/8fa00206103f16bc4cc4edffbfe100c5.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/eb/79/f5/eb79f53e070d64cc7d3ff13ce8286f7b.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/2b/43/66/2b43666d9abdbb99d6c70b8a3e7dbb1f.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/8a/cc/34/8acc3442657d19c011e40ebfb77ae4b4.jpg"
    ],
    "OnePiece": [
      "https://wsrv.nl/?url=i.pinimg.com/736x/21/fe/20/21fe203248386de913e614bc4da07e99.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/e4/21/53/e42153bb5352cbb7a876a3939fc9f12d.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/ec/d6/ac/ecd6ace4d265c0bb6f1e69da5982823a.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/f6/00/c7/f600c7e2ed9e5bdcf9a58434771cff71.jpg"
    ],
    "DemonSlayer": [
      "https://wsrv.nl/?url=i.pinimg.com/736x/b6/2a/52/b62a52dfdb0d8927806f0e4b2d5a3c20.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/77/84/af/7784af2dd861e68ce0b0cf7bc508c903.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/ad/e5/22/ade522616f9f6880ea8f3522ce11a7c5.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/2e/0f/76/2e0f76cd1f9e80ba5cf44e0586e9cd8f.jpg"
    ],
    "SpyXFamily": [
      "https://wsrv.nl/?url=i.pinimg.com/736x/11/48/dd/1148dd2632bcfce4eecded4255776d54.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/3b/b1/d5/3bb1d5c2fcba59a22d56c075f92270bb.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/f8/bf/bd/f8bfbdeba59929837cc6b7190013d789.jpg"
    ],
    "TokyoGhoul": [
      "https://wsrv.nl/?url=i.pinimg.com/736x/43/97/81/4397811cd48bba4cc3e6fc1f71a74d22.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/91/9f/fa/919ffa8c04ec0d8763ecec695bb38891.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/db/2a/0f/db2a0f8bfdfcb762df2dfedda9ab9027.jpg"
    ],
    "DragonBall": [
      "https://wsrv.nl/?url=i.pinimg.com/736x/10/7c/cc/107cccf4fc51ccfbb8da998dbf5a2c27.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/60/ba/bd/60babd41b6196ff34ff833b7e716ed5d.jpg",
      "https://wsrv.nl/?url=i.pinimg.com/736x/a2/6b/6a/a26b6ab78f0b1825b0cb0e3a6bc41151.jpg"
    ]
  }
};

const WebsiteConfigContext = createContext<{config: WebsiteConfig, isLoading: boolean}>({ config: DEFAULT_CONFIG, isLoading: true });

export function WebsiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WebsiteConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'website', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig({ ...DEFAULT_CONFIG, ...data } as WebsiteConfig);
        if (data.apiKeys) {
          setMetadataKeys(data.apiKeys);
        }
        if (data.name) {
          document.title = data.name;
        }
        if (data.logoUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.logoUrl;
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot Error [website/config]:", error);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <WebsiteConfigContext.Provider value={{ config, isLoading }}>
      {children}
    </WebsiteConfigContext.Provider>
  );
}

export const useWebsiteConfig = () => useContext(WebsiteConfigContext);
