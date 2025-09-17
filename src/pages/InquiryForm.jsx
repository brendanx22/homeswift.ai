import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const InquiryForm = () => {
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState("");
  const [selectedDate, setSelectedDate] = useState("Thur, Aug 07");
  const [movemateEnabled, setMovemateEnabled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("August 2025");

  const calendar = [
    [null, null, null, null, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showBack 
        onBack={() => navigate("/property/1")} 
        title="Make Your Inquiry" 
      />
      
      <div className="px-6 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Make Your Inquiry</h1>
          <p className="text-muted-foreground">
            Curious about this property? Drop your inquiry here
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Inquiry Section */}
            <Card className="p-4 bg-card border-border">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-foreground">Inquiry</h3>
                <p className="text-sm text-muted-foreground">
                  Write any details or requests you'd like the property owner to know
                </p>
              </div>
              <Textarea
                placeholder="Start typing..."
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                className="min-h-[120px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </Card>

            {/* Preferred Move-in Date */}
            <Card className="p-4 bg-card border-border">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Preferred Move-in Date</h3>
                <p className="text-sm text-muted-foreground">
                  Select the preferred day you would like to move in
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">{selectedDate}</span>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-foreground">{currentMonth}</span>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="text-center text-xs text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    {calendar.flat().map((day, index) => (
                      <div
                        key={index}
                        className={`text-center text-sm py-2 cursor-pointer rounded ${
                          day === 7
                            ? "bg-primary text-primary-foreground"
                            : day
                            ? "text-foreground hover:bg-accent"
                            : ""
                        }`}
                      >
                        {day || ""}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Rental Summary */}
            <Card className="p-4 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Rental Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground">PROPERTY NAME:</span>
                  <div className="text-sm font-medium text-foreground">
                    3 - Bedroom Flat at GRA Phase 1
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">LOCATION:</span>
                  <div className="text-sm font-medium text-foreground">
                    No. 15 Okpanam Road, Asaba
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">PAYMENT BREAKDOWN:</span>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Rent:</span>
                    <span className="text-sm font-medium text-foreground">₦ 950,000/year</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">TOTAL:</span>
                  <div className="text-xl font-bold text-foreground">₦ 950,000</div>
                </div>
              </div>
            </Card>

            {/* Movemate */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Movemate</h3>
                  <span className="text-xs bg-info text-white px-2 py-0.5 rounded">NEW</span>
                </div>
                <Switch
                  checked={movemateEnabled}
                  onCheckedChange={setMovemateEnabled}
                />
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                A Movemate is a personal guide for house tours, helping renters and 
                buyers visit properties with ease and confidence.{" "}
                <span className="text-info cursor-pointer">Learn More</span>
              </p>
              
              <div className="text-xs text-muted-foreground">
                Turn On (Optional)
              </div>
            </Card>

            <Button 
              onClick={handleSubmit}
              className="w-full bg-muted text-muted-foreground hover:bg-muted/80"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={showSuccessModal}
        onClose={handleSuccessClose}
        type="success"
        title="Inquiry Sent!"
        message="Your inquiry has been successfully sent to the property owner. You will get a response within 24-48 hours."
        showBackHome
        onBackHome={handleSuccessClose}
        showEdit
        onEdit={handleSuccessClose}
        cancelText="Edit"
      />
    </div>
  );
};

export default InquiryForm;