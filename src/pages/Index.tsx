import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Building2, FileText, RefreshCw } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">LEI Services</h1>
              <p className="text-sm text-muted-foreground">Legal Entity Identifier Registration & Renewal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Manage Your LEI Number
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Register a new Legal Entity Identifier or renew your existing LEI to maintain regulatory compliance.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Register New LEI */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Register New LEI</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Get a new Legal Entity Identifier for your organization to comply with regulatory requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>• Complete entity information</li>
                  <li>• Regulatory compliance verification</li>
                  <li>• 1-2 business day processing</li>
                  <li>• Valid for 1 year</li>
                </ul>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/register')}
                >
                  Start Registration
                </Button>
              </CardContent>
            </Card>

            {/* Renew Existing LEI */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Renew Existing LEI</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Extend your current LEI registration to maintain continuous compliance and avoid expiration.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>• Quick renewal process</li>
                  <li>• Update entity information</li>
                  <li>• Same-day processing</li>
                  <li>• Extended validity period</li>
                </ul>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/renew')}
                >
                  Renew LEI
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">What is an LEI?</h3>
                <p className="text-muted-foreground">
                  A Legal Entity Identifier (LEI) is a 20-character reference code to uniquely identify 
                  legally distinct entities that engage in financial transactions. It's required for 
                  regulatory reporting and compliance in many jurisdictions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;