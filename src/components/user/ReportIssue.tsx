import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Upload, Camera } from 'lucide-react';

export const ReportIssue: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address: address
          });
          
          toast({
            title: "Location captured",
            description: "Your location has been added to the report.",
          });
        } catch (error) {
          console.error('Error getting address:', error);
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude}, ${longitude}`
          });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Error",
          description: "Could not get your location. Please try again.",
          variant: "destructive",
        });
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !image || !location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including image and location.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload image to Supabase storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('issue-images')
        .getPublicUrl(filePath);

      // Categorize the issue using AI
      let aiCategory = 'Other';
      let aiConfidence = 0;
      
      try {
        const { data: aiResult, error: aiError } = await supabase.functions.invoke('categorize-issue', {
          body: {
            imageUrl: publicUrl,
            description: description
          }
        });

        if (!aiError && aiResult) {
          aiCategory = aiResult.category || 'Other';
          aiConfidence = aiResult.confidence || 0;
        }
      } catch (aiError) {
        console.error('AI categorization failed:', aiError);
        // Continue without AI categorization
      }

      // Create issue record
      const { error: insertError } = await supabase
        .from('issues')
        .insert({
          user_id: user.id,
          title,
          description,
          image_url: publicUrl,
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          ai_category: aiCategory,
          ai_confidence: aiConfidence,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Issue reported successfully!",
        description: `Your issue has been categorized as "${aiCategory}" and submitted for review.`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      setLocation(null);

    } catch (error: any) {
      console.error('Error submitting issue:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Report Civic Issue
        </CardTitle>
        <CardDescription>
          Help improve your community by reporting civic issues like potholes, broken streetlights, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Large pothole on Main Street"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Upload Image *</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Issue preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="image" className="cursor-pointer">
                        Choose Image
                      </label>
                    </Button>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a clear photo of the issue
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location *</Label>
            <div className="space-y-2">
              <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                variant="outline"
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </Button>
              {location && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Location captured:</p>
                  <p className="text-sm font-medium">{location.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting Issue...' : 'Submit Issue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};