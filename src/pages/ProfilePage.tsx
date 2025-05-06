"use client";

import { AuthStore } from "../stores/AuthStore";

import React from "react";
// import { FeatherLock } from "@subframe/core";
// import { FeatherBellRing } from "@subframe/core";
// import { FeatherCreditCard } from "@subframe/core";
// import { FeatherShapes } from "@subframe/core";
// import { FeatherUsers } from "@subframe/core";
import { FeatherUpload } from "@subframe/core";
import { TextField } from "../ui/components/TextField";
import { Button } from "../ui/components/Button";
// import { SettingsMenu } from "../ui/components/SettingsMenu";

export const ProfilePage = () => {
  const authStore = AuthStore.use();
  return (
    <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
      <div className="container max-w-none flex grow shrink-0 basis-0 flex-col items-center gap-6 self-stretch bg-default-background py-12 shadow-sm">
        <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
          <div className="flex w-full flex-col items-start gap-1">
            <span className="w-full text-heading-2 font-heading-2 text-default-font">
              Профиль
            </span>
            <span className="w-full text-body font-body text-subtext-color">
              Обновите или добавьте новую информацию в ваш профиль
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-body-bold font-body-bold text-default-font">
                Аватар
              </span>
              <div className="flex items-center gap-4">
                <img
                  className="h-16 w-16 flex-none object-cover [clip-path:circle()]"
                  src=""
                  alt="avatar"
                />
                <div className="flex flex-col items-start gap-2">
                  <Button
                    variant="neutral-secondary"
                    icon={<FeatherUpload />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                      alert(event.target)
                    }
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-4">
              <TextField
                className="h-auto grow shrink-0 basis-0"
                label="Никнейм"
                helpText=""
              >
                <TextField.Input
                  placeholder=""
                  value={authStore.user ? authStore.user.username : ""}
                  readOnly
                />
              </TextField>
            </div>
            <div className="flex w-full items-center gap-4">
              <TextField
                className="h-auto grow shrink-0 basis-0"
                label="Email"
                helpText=""
              >
                <TextField.Input
                  placeholder="admin@admin.com"
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    event;
                  }}
                />
              </TextField>
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          <div className="flex w-full flex-col items-start gap-6">
            <span className="text-heading-3 font-heading-3 text-default-font">
              Password
            </span>
            <TextField
              className="h-auto w-full flex-none"
              label="Текущий пароль"
              helpText=""
            >
              <TextField.Input
                type="password"
                placeholder="Введите текущий пароль"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  event;
                }}
              />
            </TextField>
            <TextField
              className="h-auto w-full flex-none"
              label="Новый пароль"
              helpText="Новый пароль должен состоять не менее чем из 8 символов, включать одну заглавную букву и одну цифру."
            >
              <TextField.Input
                type="password"
                placeholder="Введите новый пароль"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  event;
                }}
              />
            </TextField>
            <TextField className="h-auto w-full flex-none" label="" helpText="">
              <TextField.Input
                type="password"
                placeholder="Подтвердите новый пароль"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  event;
                }}
              />
            </TextField>
            <TextField className="h-auto w-full flex-none" label="" helpText="">
              <TextField.Input
                type="text"
                placeholder="telegram id"
                readOnly
                value={String(authStore?.user?.tg_id || 0)}
              />
            </TextField>
            <div className="flex w-full flex-col items-start justify-center gap-6">
              <Button
                variant="neutral-secondary"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event;
                }}
              >
                Изменить пароль
              </Button>
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
        </div>
      </div>
    </div>
  );
};
