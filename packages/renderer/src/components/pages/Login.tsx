import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginToWebsite } from "@/components/logic/generator";
import { Checkbox } from "@/components/ui/checkbox";
import { useAtom } from "jotai";
import { appState } from "@/lib/store";
import { main } from "#preload";

const formSchema = z.object({
  id: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  saveAccountInfo: z.boolean(),
});
type AccountInfo = z.infer<typeof formSchema>;

const Login: React.FC = () => {
  const accountInfo: AccountInfo | null = main.store.get(
    "accountInfo",
  ) as unknown as AccountInfo | null;
  console.log("🚀 ~ file: Login.tsx:33 ~ accountInfo:", accountInfo);
  const [, setAppState] = useAtom(appState);

  const form = useForm<AccountInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: accountInfo?.id ?? "",
      password: accountInfo?.password ?? "",
      saveAccountInfo: accountInfo?.saveAccountInfo ?? false,
    },
  });

  function onSubmit(values: AccountInfo) {
    const isSaveAccountInfo = form.watch("saveAccountInfo");

    if (isSaveAccountInfo) {
      console.log("🚀 ~ file: Login.tsx:47 ~ onSubmit ~ isSaveAccountInfo:", isSaveAccountInfo);
      main.store.set("accountInfo", values);
      setTimeout(() => main.store.get("accountInfo"), 1000);
    } else if (!isSaveAccountInfo && accountInfo) {
      main.store.delete("accountInfo");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    loginToWebsite(values);
    setAppState({ isLogin: true, isScan: false });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-8"
      >
        <RenderField
          control={form.control}
          name="id"
          label="아이디"
          description="LCAMPUS 아이디"
        />
        <RenderField
          control={form.control}
          name="password"
          label="비밀번호"
          description="LCAMPUS 비밀번호"
          type="password"
        />
        <div className="space-y-3">
          <SaveAccountCheckbox control={form.control} />
          <Button
            type="submit"
            className="p-4 px-9"
          >
            로그인
          </Button>
        </div>
      </form>
    </Form>
  );
};

type RenderFieldProps = {
  control?: never;
  name: keyof AccountInfo;
  label: string;
  description: string;
  type?: "text" | "password";
};

const RenderField: React.FC<RenderFieldProps> = ({
  control,
  name,
  label,
  description,
  type = "text",
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <div className="flex items-center justify-between">
          <FormLabel className="whitespace-nowrap">{label}</FormLabel>
          <FormDescription>{description}</FormDescription>
        </div>
        <FormControl>
          <Input
            type={type}
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

type SaveAccountCheckboxProps = {
  control?: never;
};

const SaveAccountCheckbox: React.FC<SaveAccountCheckboxProps> = ({ control }) => (
  <FormField
    control={control}
    name="saveAccountInfo"
    render={({ field }) => (
      <div className="flex items-center space-x-2">
        <Checkbox
          id="save-account-info"
          checked={field.value}
          onCheckedChange={() => field.onChange(!field.value)}
        />
        <label
          htmlFor="save-account-info"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          계정 정보 저장
        </label>
      </div>
    )}
  />
);

export default Login;
