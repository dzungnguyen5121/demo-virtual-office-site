import { useEffect, useState } from "react";
import {
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import visaLogoUrl from "../../../assets/Visa_Brandmark_White_RGB_2021.svg";
import chipUrl from "../../../assets/chip.png";


const tDict = {
  en: {
    payment: "Payment Methods",
    addCard: "Add New Card",
    cardNumber: "Card Number",
    expiryDate: "Expiry (MM/YY)",
    cardHolder: "Card Holder Name",
    cvv: "CVV",
    saveCard: "Save Card",
    cancel: "Cancel",
    noCard: "No saved payment methods. Please add a card.",
    default: "Default",
    makeDefault: "Set as Default",
    remove: "Remove",
    confirmRemoveTitle: "Remove Payment Method",
    confirmRemoveDesc: "Are you sure you want to remove this card? This action cannot be undone.",
    confirm: "Confirm",
    cannotRemoveLast: "You cannot remove your only payment method.",
  },
};

interface UserCard {
  id: string;
  brand: 'Visa' | 'Mastercard';
  number: string;
  last4: string;
  holder: string;
  expiry: string;
  cvv: string;
  isDefault: boolean;
}

export function PaymentSettingsTab() {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const t = tDict.en;
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setCards([
      { id: "c1", brand: "Visa", number: "4242 4242 4242 4242", last4: "4242", holder: "Nguyen Van A", expiry: "12/28", cvv: "123", isDefault: true },
      { id: "c2", brand: "Mastercard", number: "5522 8888 2222 8888", last4: "8888", holder: "Nguyen Van A", expiry: "06/27", cvv: "456", isDefault: false },
    ]);
  }, []);

  const handleAddCard = (card: UserCard) => {
    setCards((prev) => [...prev, card]);
    setShowForm(false);
  };

  const handleRemoveCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setConfirmId(null);
  };

  const handleSetDefault = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
      })),
    );
  };

  const selectedCard = confirmId ? cards.find((c) => c.id === confirmId) : null;

  return (
    <>
      {/* Payment Section */}
      <section id="payment">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t.payment}</h2>
          <Button onClick={() => setShowForm(true)} className="rounded-xl bg-yellow-400 text-slate-900 hover:bg-yellow-500"><Plus className="mr-2 h-4 w-4" /> {t.addCard}</Button>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">{t.noCard}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-1">
            {cards.map((card) => (
              <PaymentCard 
                key={card.id} 
                card={card}
                onSetDefault={handleSetDefault}
                onAskRemove={setConfirmId}
                t={t}
              />
            ))}
          </div>
        )}
      </section>

      {/* Add Card Dialog */}
      {showForm && (
        <AddCardDialog 
          onClose={() => setShowForm(false)} 
          onAddCard={handleAddCard}
          t={t}
          isFirstCard={cards.length === 0}
        />
      )}

      {/* Confirm Remove Dialog */}
      {selectedCard && (
        <ConfirmRemoveDialog
          card={selectedCard}
          onClose={() => setConfirmId(null)}
          onConfirmRemove={handleRemoveCard}
          t={t}
        />
      )}
    </>
  );
}

// ===== Subcomponents =====

function PaymentCard({ card, onSetDefault, onAskRemove, t }: { card: UserCard, onSetDefault: (id: string) => void, onAskRemove: (id: string) => void, t: typeof tDict.en }) {
  const CardLogo = card.brand === 'Visa' ? VisaLogo : MastercardLogo;
  return (
    <div>
      {card.isDefault && (
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-semibold text-green-700">{t.default}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {/* Card Front */}
        <div className="relative flex flex-col justify-between rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg aspect-[1.5857]">
          <div className="flex items-start justify-end">
            <CardLogo />
          </div>
          <div>
            <div className="mb-2">
              <CardChip />
            </div>
            <p className="font-mono text-2xl tracking-widest">**** **** **** {card.last4}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase text-slate-400">Card Holder</p>
                <p className="font-sans tracking-wide uppercase">{card.holder}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-slate-400">Valid Thru</p>
                <p className="font-sans tracking-wide">{card.expiry}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card Back */}
        <div className="relative flex flex-col justify-between rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white shadow-lg aspect-[1.5857]">
          <div className="mt-6 h-12 w-full bg-black"></div>
          <div className="mx-6 mt-6 flex items-start justify-between">
            <div className="mr-4 h-10 flex-1 rounded-sm border border-white/30 bg-white/90 shadow-inner"></div>
            <div className="ml-4 w-20 text-right">
              <div className="rounded bg-white px-2 py-1 font-mono text-black shadow-sm">
                {card.cvv}
              </div>
              <p className="mt-1 text-xs text-slate-400">CVV</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        {!card.isDefault && 
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => onSetDefault(card.id)}>{t.makeDefault}</Button>
        }
        <Button size="sm" variant="ghost" className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => onAskRemove(card.id)}>
          {t.remove}
        </Button>
      </div>
    </div>
  )
}

function AddCardDialog({ onClose, onAddCard, t, isFirstCard }: { onClose: () => void, onAddCard: (card: UserCard) => void, t: typeof tDict.en, isFirstCard: boolean }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const num = (data.get("number") as string) || "";
    onAddCard({
      id: Math.random().toString(36).slice(2),
      brand: num.startsWith("4") ? "Visa" : "Mastercard", // Simple detection
      number: num,
      last4: num.slice(-4),
      holder: data.get("holder") as string,
      expiry: data.get("expiry") as string,
      cvv: data.get("cvv") as string,
      isDefault: isFirstCard,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{t.addCard}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <label htmlFor="holder" className="mb-1 block text-sm font-medium text-slate-700">{t.cardHolder}</label>
            <Input name="holder" id="holder" required placeholder="JOHN DOE" className="rounded-lg" />
          </div>
          <div>
            <label htmlFor="number" className="mb-1 block text-sm font-medium text-slate-700">{t.cardNumber}</label>
            <Input name="number" id="number" required placeholder="0000 0000 0000 0000" className="rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="mb-1 block text-sm font-medium text-slate-700">{t.expiryDate}</label>
              <Input name="expiry" id="expiry" required placeholder="MM/YY" className="rounded-lg" />
            </div>
            <div>
              <label htmlFor="cvv" className="mb-1 block text-sm font-medium text-slate-700">{t.cvv}</label>
              <Input name="cvv" id="cvv" required placeholder="123" className="rounded-lg" />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={onClose} variant="outline" className="rounded-xl">{t.cancel}</Button>
            <Button type="submit" className="rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]">{t.saveCard}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmRemoveDialog({ card, onClose, onConfirmRemove, t }: { card: UserCard, onClose: () => void, onConfirmRemove: (id: string) => void, t: typeof tDict.en }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-900">{t.confirmRemoveTitle}</h3>
        <p className="mt-2 text-sm text-slate-600">{t.confirmRemoveDesc}</p>
        <p className="mt-2 text-sm font-medium text-slate-800">{card.brand} &bull;&bull;&bull;&bull; {card.last4}</p>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>{t.cancel}</Button>
          <Button className="rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={() => onConfirmRemove(card.id)}>{t.confirm}</Button>
        </div>
      </div>
    </div>
  )
}

const CardChip = () => <img src={chipUrl} alt="Card chip" className="h-10 w-auto" />;

const VisaLogo = () => <img src={visaLogoUrl} alt="Visa" className="h-[25px] w-auto" />;

const MastercardLogo = () => (
  <svg className="h-[25px] w-auto" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12.5" cy="12.5" r="12.5" fill="#EB001B"/>
    <circle cx="27.5" cy="12.5" r="12.5" fill="#F79E1B" fillOpacity="0.8"/>
  </svg>
)
