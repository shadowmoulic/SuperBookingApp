import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Users, BadgeCheck, Sparkles } from "lucide-react";
import api from "../api/api";
import Loading from "../components/Loading";

function BookingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const nationality = useMemo(() => {
    const query = searchParams.get("nationality");
    return query === "foreigner" ? "foreigner" : "indian";
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/experience/${id}`);
        setExperience(res.data);
      } catch {
        setError("Unable to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const dates = useMemo(() => {
    const baseDate = new Date();
    return Array.from({ length: 8 }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + index);
      return {
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        month: date.toLocaleDateString("en-US", { month: "long" }),
        iso: date.toISOString().slice(0, 10),
      };
    });
  }, []);

  useEffect(() => {
    if (!selectedOption && experience) {
      const ticketTypes = experience.ticket_types || [];
      let fallback = null;
      if (ticketTypes.length) {
        const matcher = nationality === "foreigner"
          ? (ticket) => ticket.name.toLowerCase().includes("foreign") || ticket.name.toLowerCase().includes("intl") || ticket.name.toLowerCase().includes("international")
          : (ticket) => ticket.name.toLowerCase().includes("india") || ticket.name.toLowerCase().includes("local");
        fallback = ticketTypes.find(matcher) || ticketTypes.find((ticket) => ticket.is_active) || ticketTypes[0];
      }

      if (fallback) {
        setSelectedOption({
          id: fallback.public_id || fallback.name,
          title: fallback.name,
          description: fallback.description || "Entry access",
          price: Number(fallback.pricing_rules?.[0]?.final_price || experience.entry_fee_base || 20),
        });
      } else {
        setSelectedOption({
          id: "general",
          title: "General Admission",
          description: "Main entry access",
          price: Number(experience.entry_fee_base || 20),
        });
      }
    }
  }, [experience, selectedOption, nationality]);

  const selectedPrice = Number(selectedOption?.price || experience?.entry_fee_base || 0);
  const totalPrice = adultCount * selectedPrice + childCount * 0;
  const totalTickets = adultCount + childCount;

  const handleContinue = () => {
    alert("Payment is not enabled yet. The booking experience will be live soon.");
  };

  if (loading) return <Loading />;
  if (error) return <div className="min-h-screen bg-background flex items-center justify-center p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.45fr]">
          <section className="rounded-[28px] border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-outline-variant/50 pb-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles size={14} />
                Dynamic booking flow
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{experience?.name || "Experience Booking"}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                  {experience?.description || "Choose a visit date and the right ticket type for your trip."}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Select date</h2>
                  <span className="text-sm text-on-surface-variant">{dates[selectedDateIndex]?.month}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {dates.map((date, index) => {
                    const isSelected = selectedDateIndex === index;
                    return (
                      <button
                        key={date.iso}
                        onClick={() => setSelectedDateIndex(index)}
                        className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-outline-variant/50 bg-surface-container-low hover:border-primary/50"
                        }`}
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">{date.weekday}</div>
                        <div className="mt-1 text-xl font-black">{date.label.split(" ")[1]}</div>
                        <div className="text-xs font-medium">{date.label.split(" ")[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Choose ticket type</h2>
                  <span className="text-sm text-on-surface-variant">Base pricing from backend</span>
                </div>
                <div className="space-y-3">
                  {experience?.ticket_types?.length ? (
                    experience.ticket_types
                      .filter((ticket) => ticket.is_active)
                      .map((ticket, index) => {
                        const price = Number(ticket.pricing_rules?.[0]?.final_price || experience?.entry_fee_base || 20);
                        return (
                          <button
                            key={ticket.public_id || ticket.name}
                            onClick={() => {
                              setSelectedOption({
                                id: ticket.public_id || ticket.name,
                                title: ticket.name,
                                description: ticket.description || "Entry access",
                                price,
                              });
                              setAdultCount(1);
                              setChildCount(0);
                            }}
                            className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                              selectedOption?.id === (ticket.public_id || ticket.name)
                                ? "border-primary bg-primary/10"
                                : "border-outline-variant/50 bg-surface-container-low"
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-on-surface">{ticket.name}</div>
                              <div className="mt-1 text-sm text-on-surface-variant">{ticket.description || "Entry access"}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-primary">₹{price}</div>
                              <div className="text-xs text-on-surface-variant">per adult</div>
                            </div>
                          </button>
                        );
                      })
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOption({
                          id: "general",
                          title: "General Admission",
                          description: "Main entry access",
                          price: Number(experience?.entry_fee_base || 20),
                        });
                      }}
                      className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                        selectedOption?.id === "general"
                          ? "border-primary bg-primary/10"
                          : "border-outline-variant/50 bg-surface-container-low"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-on-surface">General Admission</div>
                        <div className="mt-1 text-sm text-on-surface-variant">Main entry access</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-primary">₹{Number(experience?.entry_fee_base || 20)}</div>
                        <div className="text-xs text-on-surface-variant">per adult</div>
                      </div>
                    </button>
                  )}

                  <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-on-surface">Child ticket</div>
                        <div className="mt-1 text-sm text-on-surface-variant">Children under 12 can join free</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-primary">Free</div>
                        <div className="text-xs text-on-surface-variant">with adult</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <BadgeCheck size={16} />
                Booking summary
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-surface-container p-4">
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Selected option</span>
                    <span className="font-semibold text-on-surface">{selectedOption?.title || "General Admission"}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Date</span>
                    <span className="font-semibold text-on-surface">{dates[selectedDateIndex]?.label}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Nationality</span>
                    <span className="font-semibold text-on-surface">{nationality === "foreigner" ? "Foreigner" : "Indian"}</span>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-outline-variant/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-on-surface">Adults</div>
                      <div className="text-sm text-on-surface-variant">₹{selectedPrice} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAdultCount((c) => Math.max(1, c - 1))} className="h-8 w-8 rounded-full border border-outline-variant bg-surface-container-lowest text-lg">−</button>
                      <span className="min-w-6 text-center font-bold">{adultCount}</span>
                      <button onClick={() => setAdultCount((c) => c + 1)} className="h-8 w-8 rounded-full border border-primary bg-primary/10 text-lg text-primary">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-on-surface">Children</div>
                      <div className="text-sm text-on-surface-variant">Free</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setChildCount((c) => Math.max(0, c - 1))} className="h-8 w-8 rounded-full border border-outline-variant bg-surface-container-lowest text-lg">−</button>
                      <span className="min-w-6 text-center font-bold">{childCount}</span>
                      <button onClick={() => setChildCount((c) => c + 1)} className="h-8 w-8 rounded-full border border-primary bg-primary/10 text-lg text-primary">+</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-surface-container p-4">
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Tickets</span>
                    <span className="font-semibold text-on-surface">{totalTickets}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Adults</span>
                    <span className="font-semibold text-on-surface">₹{adultCount * selectedPrice}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-on-surface-variant">
                    <span>Children</span>
                    <span className="font-semibold text-on-surface">₹0</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-outline-variant/60 pt-3 text-lg font-black text-on-surface">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-md disabled:cursor-not-allowed disabled:bg-outline-variant/50"
              >
                <Users size={16} />
                Payment coming soon
              </button>
              <p className="mt-3 text-center text-sm text-on-surface-variant">
                Payment setup is not live yet. Booking details are ready for the next step.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
