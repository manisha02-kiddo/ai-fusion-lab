"use client";

import React, { useContext, useState, useEffect } from "react";
import AiModelList from "../shared/AiModelList";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";
import { DefaultModel } from "../shared/AiModelsShared";

export default function AiMultiModels() {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const { aiSelectedModels, setAiSelectedModels } = useContext(AiSelectedModelContext);

  // ✅ Fetch saved preferences (Firestore + localStorage)
  useEffect(() => {
    const fetchUserModels = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) {
        // If user not logged in, just load from localStorage
        const localPref = localStorage.getItem("selectedModelPref");
        if (localPref) {
          setAiSelectedModels(JSON.parse(localPref));
        } else {
          setAiSelectedModels(DefaultModel);
          localStorage.setItem("selectedModelPref", JSON.stringify(DefaultModel));
        }
        return;
      }

      const userEmail = user.primaryEmailAddress.emailAddress;

      try {
        const docRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const savedPref = data.selectedModelPref || DefaultModel;

          // ✅ Merge missing models from DefaultModel (safety)
          const mergedPref = { ...DefaultModel, ...savedPref };

          setAiSelectedModels(mergedPref);
          localStorage.setItem("selectedModelPref", JSON.stringify(mergedPref));

          // ✅ Ensure Firestore doc is up-to-date
          await updateDoc(docRef, { selectedModelPref: mergedPref });
        } else {
          // ✅ Create new user document with DefaultModel
          await setDoc(docRef, { selectedModelPref: DefaultModel });
          setAiSelectedModels(DefaultModel);
          localStorage.setItem("selectedModelPref", JSON.stringify(DefaultModel));
        }
      } catch (error) {
        console.error("Error fetching user models:", error);

        // ✅ LocalStorage fallback
        const localPref = localStorage.getItem("selectedModelPref");
        if (localPref) {
          setAiSelectedModels(JSON.parse(localPref));
        } else {
          setAiSelectedModels(DefaultModel);
        }
      }
    };

    fetchUserModels();
  }, [user, setAiSelectedModels]);

  // ✅ Handle model toggle
  const onToggleChange = (model, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === model ? { ...m, enable: value } : m))
    );
  };

  // ✅ Handle model selection + save to Firestore + localStorage
  const onSelectValue = async (parentModel, value) => {
    const updatedSelection = {
      ...aiSelectedModels,
      [parentModel]: { modelId: value },
    };

    setAiSelectedModels(updatedSelection);
    localStorage.setItem("selectedModelPref", JSON.stringify(updatedSelection));

    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) return;

    try {
      const docRef = doc(db, "users", userEmail);
      await updateDoc(docRef, { selectedModelPref: updatedSelection });
    } catch (err) {
      console.error("Error updating user model preference:", err);
    }
  };

  // ✅ No loading message — show models immediately
  return (
    <div className="w-full h-[75vh] border-b overflow-x-auto overflow-y-hidden">
      <div className="flex min-w-max h-full">
        {aiModelList.map((model, index) => (
          <div
            key={index}
            className={`flex flex-col border-r h-full overflow-auto ${
              model.enable ? "flex-1 min-w-[400px]" : "w-[100px] flex-none"
            }`}
          >
            {/* Header */}
            <div className="flex w-full h-[70px] gap-2 items-center justify-between border-b p-4">
              <div className="flex items-center gap-4 w-full">
                <img src={model.icon} alt={model.model} width={24} height={24} />

                {model.enable && (
                  <Select
                    value={aiSelectedModels[model.model]?.modelId || ""}
                    onValueChange={(value) => onSelectValue(model.model, value)}
                    disabled={model.premium}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={
                          aiSelectedModels[model.model]?.modelId || "Select a model"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {/* Free Models */}
                      <SelectGroup className="px-3">
                        <SelectLabel className="text-sm text-gray-400">Free</SelectLabel>
                        {model.subModel.map(
                          (subModel, subIndex) =>
                            !subModel.premium && (
                              <SelectItem
                                key={`${model.model}-free-${subIndex}`}
                                value={subModel.id || subModel.name || `free-${subIndex}`}
                              >
                                {subModel.name || "Unnamed"}
                              </SelectItem>
                            )
                        )}
                      </SelectGroup>

                      {/* Premium Models */}
                      <SelectGroup className="px-3">
                        <SelectLabel className="text-sm text-gray-400">Premium</SelectLabel>
                        {model.subModel.map(
                          (subModel, subIndex) =>
                            subModel.premium && (
                              <SelectItem
                                key={`${model.model}-premium-${subIndex}`}
                                value={subModel.id || subModel.name || `premium-${subIndex}`}
                                disabled
                              >
                                {subModel.name || "Unnamed Premium"}{" "}
                                <Lock className="h-4 w-4 inline-block ml-1" />
                              </SelectItem>
                            )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                {model.enable ? (
                  <Switch
                    checked={model.enable}
                    onCheckedChange={(v) => onToggleChange(model.model, v)}
                  />
                ) : (
                  <MessageSquare
                    className="cursor-pointer"
                    onClick={() => onToggleChange(model.model, true)}
                  />
                )}
              </div>
            </div>

            {/* Premium section */}
            {model.premium && model.enable && (
              <div className="flex items-center justify-center h-full">
                <Button>
                  <Lock className="mr-2 h-4 w-4" /> Upgrade to unlock
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
