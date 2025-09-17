import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit, Calculator, Home, DollarSign, Percent, Calendar } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { ConfirmationModal } from "../components/ConfirmationModal";

const InquiryForm = ({ type = 'inquiry' }) => {
  const isCalculator = type === 'calculator';
  const location = useLocation();
  
  // Check URL for calculator mode
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('type') === 'calculator') {
      setIsCalculatorMode(true);
    }
  }, [location]);
  const navigate = useNavigate();
  // Form state
  const [inquiry, setInquiry] = useState("");
  const [selectedDate, setSelectedDate] = useState("Thur, Aug 07");
  const [movemateEnabled, setMovemateEnabled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("August 2025");
  
  // Calculator state
  const [isCalculatorMode, setIsCalculatorMode] = useState(isCalculator);
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  
  // Calculate monthly payment
  useEffect(() => {
    if (isCalculatorMode) {
      const principal = homePrice - downPayment;
      const monthlyRate = interestRate / 100 / 12;
      const numPayments = loanTerm * 12;
      
      if (principal > 0 && monthlyRate > 0) {
        const payment = principal * 
          (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
          (Math.pow(1 + monthlyRate, numPayments) - 1);
        setMonthlyPayment(payment);
      } else if (principal > 0) {
        setMonthlyPayment(principal / numPayments);
      } else {
        setMonthlyPayment(0);
      }
    }
  }, [homePrice, downPayment, interestRate, loanTerm, isCalculatorMode]);

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

  if (isCalculatorMode) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          showBack 
          onBack={() => navigate(-1)} 
          title="Mortgage Calculator" 
        />
        
        <div className="px-6 pb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Mortgage Calculator</h1>
            <p className="text-muted-foreground">
              Estimate your monthly mortgage payments
            </p>
            
            <Card className="p-6 mb-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <Home className="w-4 h-4 mr-2" /> Home Price
                  </label>
                  <span className="text-lg font-semibold">
                    ${homePrice.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[homePrice]}
                  onValueChange={(value) => setHomePrice(value[0])}
                  min={100000}
                  max={2000000}
                  step={10000}
                  className="w-full"
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" /> Down Payment
                  </label>
                  <span className="text-lg font-semibold">
                    ${downPayment.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[downPayment]}
                  onValueChange={(value) => setDownPayment(value[0])}
                  min={0}
                  max={homePrice}
                  step={5000}
                  className="w-full"
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <Percent className="w-4 h-4 mr-2" /> Interest Rate
                  </label>
                  <span className="text-lg font-semibold">
                    {interestRate}%
                  </span>
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  min={2}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="w-4 h-4 mr-2" /> Loan Term
                  </label>
                  <span className="text-lg font-semibold">
                    {loanTerm} years
                  </span>
                </div>
                <Slider
                  value={[loanTerm]}
                  onValueChange={(value) => setLoanTerm(value[0])}
                  min={10}
                  max={30}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="bg-muted p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                    <p className="text-3xl font-bold">
                      ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
              </div>
            </Card>
            
            <div className="flex flex-col space-y-4">
              <Button size="lg" className="w-full">
                Get Pre-Approved
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/app/inquiry')}>
                Contact a Loan Officer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original inquiry form
  return (
    <div className="min-h-screen bg-background">
      <Header 
        showBack 
        onBack={() => navigate(-1)} 
        title={isCalculatorMode ? 'Mortgage Calculator' : 'Make Your Inquiry'} 
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