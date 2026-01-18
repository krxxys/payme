import { useState, useEffect } from "react";
import { Vault, Pencil, Check, X, Info } from "lucide-react";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { ProgressBar } from "./ui/ProgressBar";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../hooks/useCurrency";

interface SavingsCardProps {
  onSavingsChange?: (savings: number) => void;
  remaining: number;
}

export function SavingsCard({ onSavingsChange, remaining }: SavingsCardProps) {
  const [savings, setSavings] = useState<number>(0);
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editGoalValue, setEditGoalValue] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const { currencySymbol } = useCurrency();

  const { t } = useTranslation();

  useEffect(() => {
    api.savings.get().then((res) => {
      setSavings(res.savings);
      setSavingsGoal(res.savings_goal);
      onSavingsChange?.(res.savings);
    });
  }, [onSavingsChange]);

  const startEdit = () => {
    setEditValue(savings.toString());
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue("");
  };

  const saveEdit = async () => {
    const value = parseFloat(editValue);
    if (isNaN(value)) return;
    await api.savings.update(value);
    setSavings(value);
    onSavingsChange?.(value);
    setIsEditing(false);
  };

  const startEditGoal = () => {
    setEditGoalValue(savingsGoal.toString());
    setIsEditingGoal(true);
  };

  const cancelEditGoal = () => {
    setIsEditingGoal(false);
    setEditGoalValue("");
  };

  const saveEditGoal = async () => {
    const value = parseFloat(editGoalValue);
    if (isNaN(value) || value < 0) return;
    await api.savings.updateGoal(value);
    setSavingsGoal(value);
    setIsEditingGoal(false);
  };

  const target = savingsGoal > 0 ? savingsGoal : savings + remaining;
  const percentage = target > 0 ? (savings / target) * 100 : 0;
  const difference = savings - target;
  const isAhead = difference >= 0;

  return (
    <>
    <Card className="!p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-charcoal-500 dark:text-charcoal-400">
          {t("savings_card.text.savings")}
          </span>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-0.5 hover:bg-sand-200 dark:hover:bg-charcoal-700 rounded transition-colors touch-manipulation"
            title={t("savings_card.button.how_this_works")}
          >
            <Info size={12} className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300" />
          </button>
        </div>
        <Vault size={16} className="text-sage-600" />
      </div>
      
      {isEditing ? (
        <div className="flex items-center gap-1 mb-3">
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 !py-1 !text-base"
            autoFocus
          />
          <button
            onClick={saveEdit}
            className="p-1.5 text-sage-600 hover:bg-sage-100 dark:hover:bg-sage-900 transition-colors touch-manipulation"
          >
            <Check size={16} />
          </button>
          <button
            onClick={cancelEdit}
            className="p-1.5 text-charcoal-400 hover:bg-sand-100 dark:hover:bg-charcoal-800 transition-colors touch-manipulation"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg sm:text-xl font-semibold text-sage-700 dark:text-sage-400">
            {savings.toFixed(2)}{currencySymbol}
          </span>
          <button
            onClick={startEdit}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-200 transition-colors touch-manipulation"
          >
            <Pencil size={14} />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {isEditingGoal ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-charcoal-500 dark:text-charcoal-400">Goal:</span>
            <Input
              type="number"
              value={editGoalValue}
              onChange={(e) => setEditGoalValue(e.target.value)}
              className="flex-1 !py-0.5 !text-xs"
              autoFocus
            />
            <button
              onClick={saveEditGoal}
              className="p-0.5 text-sage-600 hover:bg-sage-100 dark:hover:bg-sage-900 transition-colors"
            >
              <Check size={12} />
            </button>
            <button
              onClick={cancelEditGoal}
              className="p-0.5 text-charcoal-400 hover:bg-sand-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-500 dark:text-charcoal-400">
              {t("savings_card.text.goal")}: {target.toFixed(2)}{currencySymbol}
            </span>
            <button
              onClick={startEditGoal}
              className="p-0.5 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-200 transition-colors"
            >
              <Pencil size={10} />
            </button>
          </div>
        )}
        
        <ProgressBar value={savings} max={target} />
        
        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${isAhead ? 'text-sage-600 dark:text-sage-400' : 'text-terracotta-600 dark:text-terracotta-400'}`}>
            {isAhead ? '✓' : '⚠️'} {Math.abs(percentage - 100).toFixed(1)}% {isAhead ? t('savings_card.text.ahead') : t('savings_card.text.behind')}
          </span>
          <span className="text-charcoal-500 dark:text-charcoal-400">
            {isAhead ? '+' : ''}{difference.toFixed(2)}
          </span>
        </div>
        
        <p className="text-xs text-charcoal-400 dark:text-charcoal-500 italic">
          {savingsGoal > 0 ? t('savings_card.text.based_on_your_goal') : t('savings_card.text.based_on_remaining_budget')}
        </p>
      </div>
    </Card>

    <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title={t("savings_card.modal.how_savings_tracking_works")}>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-charcoal-700 dark:text-sand-200 mb-2">
            {t("savings_card.text.current_savings")}
          </h3>
          <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
            {t("savings_card.text.your_actual_savings_balance,_update_this_anytime_as_you_add_or_withdraw_money")}.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-charcoal-700 dark:text-sand-200 mb-2">
            {t("savings_card.text.savings_goal")}
          </h3>
          <p className="text-sm text-charcoal-600 dark:text-charcoal-300 mb-2">
            {t("savings_card.text.set_your_own_target_amount, if_no_goal_is_set,_it_defaults_to")}:
          </p>
          <div className="bg-sand-100 dark:bg-charcoal-800 p-3 rounded text-xs font-mono">
            {t("savings_card.text.current_savings_+_remaining_budget")}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-charcoal-700 dark:text-sand-200 mb-2">
            {t("savings_card.text.progress_tracking")}
          </h3>
          <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
            {t("savings_card.text.the_progress_bar_shows_how_close_you_are_to_your_goal,_green_means_you're_ahead_and_red_means_you're_behind")}.
          </p>
        </div>

        <div className="pt-4 border-t border-sand-300 dark:border-charcoal-700">
          <Button onClick={() => setShowInfoModal(false)} className="w-full sm:w-auto">
            {t("savings_card.text.got_it")}
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
