"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  facebookOAuthExchange,
  connectFacebookPage,
  getFacebookRedirectUri,
  type FacebookOAuthPage,
} from "@/lib/crm/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type Step = "exchanging" | "select-page" | "connecting" | "done" | "error";

export default function FacebookOAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  const [step, setStep] = React.useState<Step>("exchanging");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [metaAccount, setMetaAccount] = React.useState<string | null>(null);
  const [pages, setPages] = React.useState<FacebookOAuthPage[]>([]);
  const [connectingPageId, setConnectingPageId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (oauthError) {
      setStep("error");
      setErrorMessage(oauthError);
      return;
    }
    if (!code) {
      setStep("error");
      setErrorMessage("No authorization code returned by Facebook.");
      return;
    }
    facebookOAuthExchange(code, getFacebookRedirectUri())
      .then((res) => {
        setMetaAccount(res.meta_account);
        setPages(res.pages);
        setStep("select-page");
      })
      .catch((e: unknown) => {
        setStep("error");
        setErrorMessage(e instanceof Error ? e.message : String(e));
      });
  }, [code, oauthError]);

  const handleConnect = (page: FacebookOAuthPage) => {
    if (!metaAccount) return;
    setConnectingPageId(page.id);
    connectFacebookPage(metaAccount, page.id, page.name, page.access_token)
      .then(() => {
        toast({ title: "Facebook page connected", description: `${page.name || page.id} is now linked for Lead Ads sync.` });
        setStep("done");
      })
      .catch((e: unknown) => {
        toast({
          title: "Failed to connect page",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
      })
      .finally(() => setConnectingPageId(null));
  };

  return (
    <div className="mx-auto max-w-lg py-12">
      <Card className="bg-card border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg">Connect Facebook Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "exchanging" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Exchanging authorization code with Facebook...
            </div>
          )}

          {step === "select-page" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Select the Page whose Lead Ads forms should sync into this CRM.
              </p>
              {pages.length === 0 && (
                <p className="text-xs text-amber-400">
                  No Pages returned. Make sure your Facebook user manages at least one Page and granted
                  the pages_show_list permission.
                </p>
              )}
              {pages.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{p.name || p.id}</p>
                    <p className="text-[10px] text-muted-foreground">Page ID: {p.id}</p>
                  </div>
                  <Button
                    size="sm"
                    className="text-xs h-8"
                    disabled={connectingPageId === p.id}
                    onClick={() => handleConnect(p)}
                  >
                    {connectingPageId === p.id ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Page connected. Leads will now sync via the Meta leadgen webhook.
              </div>
              <Button className="w-full text-xs h-9" onClick={() => router.push("/crm/integrations")}>
                Back to Integrations
              </Button>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <XCircle className="h-4 w-4" />
                {errorMessage}
              </div>
              <Button variant="outline" className="w-full text-xs h-9 border-white/10" onClick={() => router.push("/crm/integrations")}>
                Back to Integrations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
