import { useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { user, logout, updateUsername } = useAuth();
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { t } = useTranslation();

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");
    setUsernameSuccess(false);


    if (newUsername.length < 3 || newUsername.length > 32) {
      setUsernameError(t("settings.error.username_must_be_3-32_characters"));
      return;
    }

    setUsernameLoading(true);
    try {
      const response = await api.auth.changeUsername(newUsername);
      updateUsername(response.username);
      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch {
      setUsernameError(t("settings.error.failed_to_change_username,_it_may_already_be_taken") + ".");
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    
    if (newPassword.length < 6 || newPassword.length > 128) {
      setPasswordError(t("settings.error.password_must_be_6-128_characters"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("settings.error.passwords_do_not_match"));
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError(t("settings.error.failed_to_change_password,_check_your_current_password") + ".");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearData = async () => {
    setDeleteError("");

    if (deletePassword.length < 6) {
      setDeleteError(t("settings.error.please_enter_your_password") + ".");
      return;
    }

    setDeleteLoading(true);
    try {
      await api.auth.clearAllData(deletePassword);
      await logout();
    } catch {
      setDeleteError(t("settings.error.failed_to_clear_data,_check_your_password") + ".");
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-sand-100 transition-colors touch-manipulation"
        >
          <ArrowLeft size={16} />
          {t("settings.button.back_to_dashboard")}
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-charcoal-800 dark:text-sand-100">
          {t("settings.text.settings")}
        </h1>

        <div className="space-y-6 sm:space-y-8">
          <div className="bg-sand-100 dark:bg-charcoal-900 p-4 sm:p-6 border border-sand-200 dark:border-charcoal-800">
            <h2 className="text-base sm:text-lg font-medium mb-4 text-charcoal-800 dark:text-sand-100">
              {(t("settings.text.change_username"))}
            </h2>
            <form onSubmit={handleChangeUsername} className="space-y-4">
              <Input
                label={t("settings.input.new_username")}
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t("settings.input.enter_new_username")}
                disabled={usernameLoading}
              />
              {usernameError && (
                <p className="text-sm text-terracotta-600">{usernameError}</p>
              )}
              {usernameSuccess && (
                <p className="text-sm text-sage-600">{t("settings.text.username_changed_succesfully")}</p>
              )}
              <Button type="submit" disabled={usernameLoading || newUsername === user?.username}>
                {usernameLoading ? t("settings.button.saving") + "..." : t("settings.button.save_username")}
              </Button>
            </form>
          </div>

          <div className="bg-sand-100 dark:bg-charcoal-900 p-4 sm:p-6 border border-sand-200 dark:border-charcoal-800">
            <h2 className="text-base sm:text-lg font-medium mb-4 text-charcoal-800 dark:text-sand-100">
              {t("settings.text.change_password")}
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label={t("settings.input.current_password")}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("settings.input.enter_current_password")}
                disabled={passwordLoading}
              />
              <Input
                label={t("settings.input.new_password")}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("settings.input.enter_new_password")}
                disabled={passwordLoading}
              />
              <Input
                label={t("settings.input.confirm_new_password")}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={("settings.input.confirm_new_password")}
                disabled={passwordLoading}
              />
              {passwordError && (
                <p className="text-sm text-terracotta-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-sage-600">{t("settings.text.password_changed_successfully")}</p>
              )}
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? t("settings.button.changing") + "..." : t("settings.button.change_password")}
              </Button>
            </form>
          </div>

          <div className="bg-terracotta-50 dark:bg-charcoal-900 p-4 sm:p-6 border-2 border-terracotta-300 dark:border-terracotta-800">
            <h2 className="text-base sm:text-lg font-medium mb-2 text-terracotta-800 dark:text-terracotta-300">
              {t("settings.text.danger_zone")}
            </h2>
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-4">
              {t("settings.text.this_action_cannot_be_undone, all_your_data_will_be_permanently_deleted") + "."}
            </p>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              {t("settings.button.clear_all_data")}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletePassword("");
          setDeleteError("");
        }}
        title="Clear All Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
            {t("settings.text.this_will_permanently_delete_all_your_data_including:")}
          </p>
          <ul className="text-sm text-charcoal-600 dark:text-charcoal-300 list-disc list-inside space-y-1">
            <li>{t("settings.text.all_months_and_transactions")}</li>
            <li>{t("settings.text.all_budget_categories")}</li>
            <li>{t("settings.text.all_fixed_expenses")}</li>
            <li>{t("settings.text.all_income_entries")}</li>
            <li>{("settings.text.your_account_and_settings")}</li>
          </ul>
          <p className="text-sm font-medium text-terracotta-700 dark:text-terracotta-400">
            {("settings.text.this_action_cannot_be_undone.")}
          </p>
          <Input
            label={t("settings.input.confirm_your_password")}
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder={t("settings.input.enter_your_password")}
            disabled={deleteLoading}
          />
          {deleteError && (
            <p className="text-sm text-terracotta-600">{deleteError}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="danger" onClick={handleClearData} disabled={deleteLoading} className="w-full sm:w-auto">
              {deleteLoading ? t("settings.button.deleting") + "..." : t("settings.button.yes,_delete_everything")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePassword("");
                setDeleteError("");
              }}
              disabled={deleteLoading}
              className="w-full sm:w-auto"
            >
              {t("settings.button.cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
