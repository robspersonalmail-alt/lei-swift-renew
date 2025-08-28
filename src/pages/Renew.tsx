import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Renew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [leiNumber, setLeiNumber] = useState("");
  const [entityData, setEntityData] = useState<any>(null);
  const [formData, setFormData] = useState({
    contactEmail: "",
    website: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });

  const handleLookup = async () => {
    if (!apiKey || !leiNumber) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter both your API key and LEI number.",
        variant: "destructive"
      });
      return;
    }

    setLookupLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.functions.invoke('lei-lookup', {
        body: { leiNumber }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'LEI lookup failed');
      }
      
      setEntityData(data.entityData);
      toast({
        title: "LEI Found",
        description: "Successfully retrieved LEI information.",
      });
    } catch (error: any) {
      console.error('LEI lookup error:', error);
      toast({
        title: "Lookup Failed",
        description: error.message || "Could not find LEI information. Please check your LEI number and try again.",
        variant: "destructive"
      });
      setEntityData(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityData) {
      toast({
        title: "Entity Lookup Required",
        description: "Please lookup your LEI information first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.functions.invoke('lei-renew', {
        body: { leiNumber, formData }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'LEI renewal failed');
      }
      
      toast({
        title: "Renewal Successful",
        description: `Your LEI has been successfully renewed. ${data.newExpirationDate ? `New expiration: ${data.newExpirationDate}` : ''}`,
      });
      
      navigate("/");
    } catch (error: any) {
      console.error('LEI renewal error:', error);
      toast({
        title: "Renewal Failed",
        description: error.message || "There was an error processing your renewal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Renew LEI</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* LEI Lookup Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                LEI Lookup
              </CardTitle>
              <p className="text-muted-foreground">
                Enter your existing LEI number to retrieve current information and proceed with renewal.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">RapidLEI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leiNumber">LEI Number</Label>
                <Input
                  id="leiNumber"
                  value={leiNumber}
                  onChange={(e) => setLeiNumber(e.target.value.toUpperCase())}
                  placeholder="Enter your 20-character LEI"
                  maxLength={20}
                />
              </div>

              <Button 
                onClick={handleLookup} 
                disabled={lookupLoading || !apiKey || !leiNumber}
                className="w-full"
              >
                {lookupLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Looking up LEI...
                  </>
                ) : (
                  "Lookup LEI Information"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Entity Information Display */}
          {entityData && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Current LEI Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Legal Name</Label>
                    <p className="font-medium">{entityData.legalName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Legal Form</Label>
                    <p className="font-medium">{entityData.legalForm}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Jurisdiction</Label>
                    <p className="font-medium">{entityData.jurisdiction}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <p className="font-medium text-green-600">{entityData.status}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Registration Number</Label>
                    <p className="font-medium">{entityData.registrationNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Expiration</Label>
                    <p className="font-medium">{entityData.expirationDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Renewal Form */}
          {entityData && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Update Information for Renewal</CardTitle>
                <p className="text-muted-foreground">
                  Review and update any changed information before renewing your LEI.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRenewal} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                          placeholder="contact@example.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Updates */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Address Information (if changed)</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Leave empty if unchanged"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            value={formData.postalCode}
                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                            placeholder="Postal code"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange("country", e.target.value)}
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Renewal...
                        </>
                      ) : (
                        "Complete Renewal"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Renew;