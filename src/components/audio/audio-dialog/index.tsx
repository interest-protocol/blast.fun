import { FC } from "react";
import { Volume2, VolumeX } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

import { AudioDialogProps } from "./audio-dialog.types";
import { useAudioSettings } from "./_hooks/use-audio-settings";

const AudioDialog: FC<AudioDialogProps> = ({ open, onOpenChange }) => {
    const { settings, volumeInput, localEnabled, volumeInputRef, handlers } = useAudioSettings(open);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] backdrop-blur-sm border-2 shadow-2xl">
                <DialogHeader className="pb-2 border-b">
                    <DialogTitle className="font-mono text-base uppercase tracking-wider text-foreground/80">
                        Audio Settings
                    </DialogTitle>
                    <DialogDescription>
                        Toggle miscellanous sounds for new tokens, and buying & selling.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/30">
                        <div className="space-y-0.5">
                            <Label className="font-mono text-xs uppercase tracking-wider text-foreground/80">
                                SYSTEM AUDIO
                            </Label>
                        </div>
                        <Switch
                            id="audio-enabled"
                            checked={localEnabled}
                            onCheckedChange={handlers.handleEnabledChange}
                            className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-destructive/20 dark:data-[state=checked]:bg-destructive"
                        />
                    </div>

                    {localEnabled && (
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg border border-border/40 bg-background/30">
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="font-mono text-xs uppercase tracking-wider text-foreground/80">
                                        VOLUME LEVEL
                                    </Label>
                                    <div className="relative flex items-center select-none">
                                        <input
                                            ref={volumeInputRef}
                                            type="text"
                                            value={volumeInput}
                                            onChange={handlers.handleVolumeInputChange}
                                            onKeyDown={handlers.handleVolumeInputKeyDown}
                                            onFocus={handlers.handleVolumeInputFocus}
                                            onBlur={handlers.handleVolumeInputBlur}
                                            className="w-10 text-right font-mono text-xs uppercase bg-transparent border-b border-transparent hover:border-primary/40 focus:border-primary focus:outline-none transition-colors cursor-pointer"
                                        />
                                        <span className="font-mono text-xs uppercase text-muted-foreground ml-0.5">%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <VolumeX className="w-3 h-3 text-muted-foreground/60" />
                                    <Slider
                                        value={[settings.volume]}
                                        onValueChange={handlers.handleVolumeChange}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        className="flex-1"
                                    />
                                    <Volume2 className="w-3 h-3 text-muted-foreground/60" />
                                </div>
                            </div>
                        </div>
                    )}

                    {!localEnabled && (
                        <div className="text-center py-2">
                            <Logo className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-mono text-xs uppercase text-muted-foreground">
                                AUDIO::DISABLED
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AudioDialog;