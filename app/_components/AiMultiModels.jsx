import React, { useState } from 'react'
import AiModelList from '../shared/AiModelList'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import { Lock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AiMultiModel() {
    const [aiModelList, setAiModelList] = useState(AiModelList)

    const onToggleChange = (model, value) => {
        setAiModelList((prev) =>
            prev.map((m) =>
                m.model === model ? { ...m, enable: value } : m
            )
        )
    }

    return (
        <div className='flex flex-1 h-[75vh] border-b'>
            {aiModelList.map((model, index) => (
                <div 
                    key={index}
                    className={`flex flex-col border-r h-full overflow-auto flex-1 min-w-[400px] ${model.enable ? 'flex-1 min-w-[400px]' : 'w-[100px] flex-none'}`}
                >
                    <div className='flex w-full h-[70px] gap-2 items-center justify-between border-b p-4'>
                        <div className='flex items-center gap-4 w-full'>
                            <img src={model.icon} alt={model.model}
                                width={24} height={24}
                            />
                            
                            {model.enable && (
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={model.subModel[0].name} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {model.subModel.map((subModel, subIndex) => (
                                            <SelectItem key={subIndex} value={subModel.name}>{subModel.name}</SelectItem>
                                        ))}
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
                                <MessageSquare onClick={() => onToggleChange(model.model, true)} />
                            )}
                        </div>
                    </div>
                    
                    {/* Corrected premium section */}
                    {model.premium && model.enable && (
                        <div className='flex items-center justify-center h-full'>
                            <Button> <Lock />Upgrade to unlock</Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default AiMultiModel