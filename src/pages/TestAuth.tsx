import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TestAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAuth = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('lei-test-auth');
      
      if (error) {
        throw new Error(error.message);
      }

      setResult(data);
      toast({
        title: data.success ? "Authentication Test Successful!" : "Authentication Test Failed",
        description: data.success ? "Your credentials are valid" : data.error,
        variant: data.success ? "default" : "destructive"
      });
      console.log('Auth test result:', data);
    } catch (error: any) {
      const errorResult = { success: false, error: error.message };
      setResult(errorResult);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setRegLoading(true);
    setResult(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const testData = {
        legalName: "Test Company Ltd",
        legalForm: "corporation",
        jurisdiction: "england", 
        address: "123 Test Street",
        city: "London",
        country: "UK",
        postalCode: "SW1A 1AA",
        registrationNumber: "12345678",
        contactEmail: "test@example.com",
        website: "https://test.com"
      };
      
      const { data, error } = await supabase.functions.invoke('lei-test-registration', {
        body: { formData: testData }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      setResult(data);
      toast({
        title: data.success ? "Registration Test Successful!" : "Registration Test Failed",
        description: data.success ? "LEI registration process works" : `Failed at ${data.step}: ${data.error}`,
        variant: data.success ? "default" : "destructive"
      });
      console.log('Registration test result:', data);
    } catch (error: any) {
      const errorResult = { success: false, error: error.message };
      setResult(errorResult);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Test RapidLEI Authentication</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Authentication Test</CardTitle>
              <p className="text-muted-foreground">
                Test your RapidLEI staging credentials to ensure they're working correctly.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={testAuth}
                disabled={loading || regLoading}
                className="w-full mb-4"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Authentication...
                  </>
                ) : (
                  "Test RapidLEI Authentication"
                )}
              </Button>

              <Button 
                onClick={testRegistration}
                disabled={loading || regLoading}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {regLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Full Registration...
                  </>
                ) : (
                  "Test Full LEI Registration Process"
                )}
              </Button>

              {result && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Test Result:</h3>
                  <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="text-sm">
                      <strong>Success:</strong> {result.success ? 'Yes' : 'No'}
                    </div>
                    {result.error && (
                      <div className="text-sm mt-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    {result.debug && (
                      <div className="text-sm mt-2">
                        <strong>Debug Info:</strong>
                        <pre className="mt-1 text-xs overflow-auto">
                          {JSON.stringify(result.debug, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.data && (
                      <div className="text-sm mt-2">
                        <strong>Response Data:</strong>
                        <pre className="mt-1 text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TestAuth;