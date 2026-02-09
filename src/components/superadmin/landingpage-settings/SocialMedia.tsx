import React, { useEffect } from "react";
import { ServerActions } from "@/lib";
import { WebComponents } from "@/components";
import { SuperAdminTypes } from "@/types";

interface SocialMediaProps {
    initialSocialMediaSection?: SuperAdminTypes.LandingSettingPageTypes.SocialMediaSettings | null;
}

const SocialMedia = ({ initialSocialMediaSection }: SocialMediaProps) => {
    const [socialMediaFormData, setSocialMediaFormData] = React.useState<SuperAdminTypes.LandingSettingPageTypes.SocialMediaFormData>({
        instagramLink: initialSocialMediaSection?.InstagramLink || '',
        facebookLink: initialSocialMediaSection?.FacebookLink || '',
        twitterLink: initialSocialMediaSection?.TwitterLink || '',
        youtubeLink: initialSocialMediaSection?.YoutubeLink || ''
    });
    const [socialMediaLoading, setSocialMediaLoading] = React.useState(false);

    // Sync state with prop when it changes
    useEffect(() => {
        if (initialSocialMediaSection) {
            setSocialMediaFormData({
                instagramLink: initialSocialMediaSection.InstagramLink || '',
                facebookLink: initialSocialMediaSection.FacebookLink || '',
                twitterLink: initialSocialMediaSection.TwitterLink || '',
                youtubeLink: initialSocialMediaSection.YoutubeLink || ''
            });
        }
    }, [initialSocialMediaSection]);

    const handleSaveSocialMedia = async () => {
        try {
            setSocialMediaLoading(true);
            const result = await ServerActions.ServerActionslib.updateSocialMediaLinksAction(socialMediaFormData);

            if (result.success) {
                if (result.data) {
                    setSocialMediaFormData({
                        instagramLink: result.data.InstagramLink || '',
                        facebookLink: result.data.FacebookLink || '',
                        twitterLink: result.data.TwitterLink || '',
                        youtubeLink: result.data.YoutubeLink || ''
                    });
                }

                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
                    text: "Social media links saved successfully!"
                });
            } else {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
                    text: result.error || 'Failed to save social media links'
                });
            }
        } catch (error: unknown) {
            console.error('Save social media links error:', error);
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
                text: 'Failed to save social media links'
            });
        } finally {
            setSocialMediaLoading(false);
        }
    };
    return (
        <div className="m-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Social Media Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="instagram-link">
                        Instagram Link
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="instagram-link"
                        type="url"
                        value={socialMediaFormData.instagramLink}
                        onChange={(e) => setSocialMediaFormData(prev => ({ ...prev, instagramLink: e.target.value }))}
                        placeholder="https://instagram.com/yourprofile"
                        className="mt-2"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="facebook-link">
                        Facebook Link
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="facebook-link"
                        type="url"
                        value={socialMediaFormData.facebookLink}
                        onChange={(e) => setSocialMediaFormData(prev => ({ ...prev, facebookLink: e.target.value }))}
                        placeholder="https://facebook.com/yourpage"
                        className="mt-2"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="twitter-link">
                        Twitter Link
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="twitter-link"
                        type="url"
                        value={socialMediaFormData.twitterLink}
                        onChange={(e) => setSocialMediaFormData(prev => ({ ...prev, twitterLink: e.target.value }))}
                        placeholder="https://twitter.com/yourprofile"
                        className="mt-2"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="youtube-link">
                        Youtube Link
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="youtube-link"
                        type="url"
                        value={socialMediaFormData.youtubeLink}
                        onChange={(e) => setSocialMediaFormData(prev => ({ ...prev, youtubeLink: e.target.value }))}
                        placeholder="https://youtube.com/yourchannel"
                        className="mt-2"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="save"
                    onClick={handleSaveSocialMedia}
                    disabled={socialMediaLoading}
                >
                    {socialMediaLoading ? 'Saving...' : 'Save'}
                </WebComponents.UiComponents.UiWebComponents.Button>
            </div>
        </div>
    );
};

export default SocialMedia;
