import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { countries, getCountryName } from "@/data/countries";
import { legalForms, getLegalFormsByJurisdiction, getLegalFormName } from "@/data/legalForms";
import { getSupportedJurisdictions } from "@/data/supportedJurisdictions";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [supportedJurisdictions, setSupportedJurisdictions] = useState<any[]>([]);
  const [loadingJurisdictions, setLoadingJurisdictions] = useState(true);
  const [formData, setFormData] = useState({
    legalName: "",
    legalForm: "",
    jurisdiction: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    registrationNumber: "",
    website: "",
    contactEmail: "",
    firstName: "",
    lastName: "",
    contactPhone: "",
    isLevel2DataAvailable: false,
    multiYearSupport: 1
  });

  // Load supported jurisdictions on component mount
  React.useEffect(() => {
    const loadSupportedJurisdictions = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke('lei-lookup-jurisdictions');
        
        if (error) {
          console.error('Failed to load supported jurisdictions:', error);
          // Fallback to predefined list
          setSupportedJurisdictions(getSupportedJurisdictions());
        } else if (data?.success && data?.jurisdictions) {
          setSupportedJurisdictions(data.jurisdictions);
        } else {
          // Fallback to predefined list
          setSupportedJurisdictions(getSupportedJurisdictions());
        }
      } catch (error) {
        console.error('Error loading jurisdictions:', error);
        // Fallback to predefined list
        setSupportedJurisdictions(getSupportedJurisdictions());
      } finally {
        setLoadingJurisdictions(false);
      }
    };

    loadSupportedJurisdictions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      { field: 'firstName', message: 'First Name is required' },
      { field: 'lastName', message: 'Last Name is required' },
      { field: 'legalName', message: 'Legal Entity Name is required' },
      { field: 'legalForm', message: 'Legal Form is required' },
      { field: 'jurisdiction', message: 'Jurisdiction is required' },
      { field: 'registrationNumber', message: 'Registration Number is required' },
      { field: 'address', message: 'Street Address is required' },
      { field: 'city', message: 'City is required' },
      { field: 'postalCode', message: 'Postal Code is required' },
      { field: 'country', message: 'Country is required' },
      { field: 'contactEmail', message: 'Contact Email is required' },
      { field: 'contactPhone', message: 'Contact Phone is required' }
    ];

    for (const { field, message } of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        toast({
          title: "Required Field Missing",
          description: message,
          variant: "destructive"
        });
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Validate legal name length (minimum 3 characters)
    if (formData.legalName.trim().length < 3) {
      toast({
        title: "Invalid Legal Name",
        description: "Legal Entity Name must be at least 3 characters long",
        variant: "destructive"
      });
      return;
    }

    // Validate registration number format (alphanumeric, at least 3 characters)
    if (formData.registrationNumber.trim().length < 3) {
      toast({
        title: "Invalid Registration Number",
        description: "Registration Number must be at least 3 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Prepare clean data for submission with proper codes
      const cleanFormData = {
        ...formData,
        legalName: formData.legalName.trim(),
        jurisdiction: formData.jurisdiction.trim(), // This is now an ISO code
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(), // This is now an ISO code
        postalCode: formData.postalCode.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        website: formData.website.trim() || undefined // Remove empty string
      };
      
      const { data, error } = await supabase.functions.invoke('lei-register', {
        body: { formData: cleanFormData }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      
      toast({
        title: "Registration Successful",
        description: `Your LEI registration has been submitted. ${data.leiNumber ? `LEI Number: ${data.leiNumber}` : 'Processing...'}`,
      });
      
      navigate("/");
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed", 
        description: error.message || "There was an error processing your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
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
            <h1 className="text-xl font-semibold text-foreground">Register New LEI</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl">LEI Registration Form</CardTitle>
              <p className="text-muted-foreground">
                Please provide accurate information about your legal entity. All fields are required for registration.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Entity Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Entity Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legalName">Legal Entity Name</Label>
                      <Input
                        id="legalName"
                        value={formData.legalName}
                        onChange={(e) => handleInputChange("legalName", e.target.value)}
                        placeholder="Full legal name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jurisdiction">Jurisdiction</Label>
                      <Select 
                        value={formData.jurisdiction} 
                        onValueChange={(value) => handleInputChange("jurisdiction", value)}
                        disabled={loadingJurisdictions}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingJurisdictions ? "Loading jurisdictions..." : "Select jurisdiction"} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border max-h-60 overflow-y-auto">
                          {supportedJurisdictions.map((jurisdiction) => (
                            <SelectItem key={jurisdiction.code || jurisdiction.jurisdiction_code} value={jurisdiction.code || jurisdiction.jurisdiction_code}>
                              {jurisdiction.name || jurisdiction.jurisdiction_name} ({jurisdiction.code || jurisdiction.jurisdiction_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legalForm">Legal Form</Label>
                      <Select 
                        value={formData.legalForm} 
                        onValueChange={(value) => handleInputChange("legalForm", value)}
                        disabled={!formData.jurisdiction}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.jurisdiction ? "Select legal form" : "Select jurisdiction first"} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border max-h-60 overflow-y-auto">
                          {getLegalFormsByJurisdiction(formData.jurisdiction).map((form) => (
                            <SelectItem key={form.code} value={form.code}>
                              {form.name} ({form.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                        placeholder="Official registration number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Registered Address</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Full street address"
                        required
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
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                          placeholder="Postal code"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name} ({country.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Person</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="First name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Test Authentication Button */}
                <div className="pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mb-4" 
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { supabase } = await import("@/integrations/supabase/client");
                        const { data, error } = await supabase.functions.invoke('lei-test-auth');
                        
                        if (error) {
                          throw new Error(error.message);
                        }

                        toast({
                          title: data.success ? "Authentication Test Successful!" : "Authentication Test Failed",
                          description: data.success ? "Your credentials are valid" : data.error,
                          variant: data.success ? "default" : "destructive"
                        });
                        console.log('Auth test result:', data);
                      } catch (error: any) {
                        toast({
                          title: "Test Failed",
                          description: error.message,
                          variant: "destructive"
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    Test Authentication Only
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Registration...
                      </>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Register;