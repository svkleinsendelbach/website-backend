import { callFunction, expectSuccess } from '../utils';

describe('bfv liveticker', () => {
    afterEach(async () => {
        const result = await callFunction('v2_deleteAllData', {});
        expectSuccess(result).to.be.equal(undefined);
    });

    it('fetch bfv liveticker', async () => {
        const result = await callFunction('v2_bfvLiveticker', {
            gameId: '02IMKEAAPS000000VS5489B3VVETK79U'
        });
        if (result.value !== undefined)
            result.value!.livetickers[0].ifModifiedSinceTimestamp = '';
        expectSuccess(result).to.be.deep.equal({
            id: '02IMKEAAPS000000VS5489B3VVETK79U',
            competition: {
                name: 'Kreisklasse 3',
                link: 'https://www.bfv.de/wettbewerbe/meisterschaften/kreisklasse-3/02ILUFAUTG000005VS5489B4VS7CGIFK-G',
                gameDay: 16
            },
            date: '2022-11-13T14:30:00.000Z',
            homeTeam: {
                name: 'SG SV Hetzles / SV Kleinsendelbach',
                link: 'https://www.bfv.de/mannschaften/sg-sv-hetzles-sv-kleinsendelbach/02EO9A1SNG000000VS5489B2VSAS84KM',
                iconLink: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKSG00000OVV0AG08LVUPGND5I'
            },
            awayTeam: {
                name: 'DJK Weingarts',
                link: 'https://www.bfv.de/mannschaften/djk-weingarts/016Q53TG2C000000VV0AG80NVS35AO43',
                iconLink: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKTO00000KVV0AG08LVUPGND5I'
            },
            adress: 'Gaiganzer Weg, 91077 Hetzles',
            adressDescription: 'Sportanlage Hetzles Gaiganzer Weg, Platz 1',
            livetickers: [
                {
                    id: '02K0D92ETS000001VS5489B5VT8CT2E0',
                    loadNew: false,
                    ifModifiedSinceTimestamp: '',
                    results: [
                        {
                            type: 'whistle',
                            card: null,
                            eventIcon: '24/whistle',
                            goal: null,
                            headline: 'Abpfiff der Begegnung',
                            likes: 0,
                            liked: false,
                            likeApiRoute: 'https://www.bfv.de/restapi/ticker/like/02K0DVSRI4000000VS5489B5VT8CT2E0',
                            unlikeApiRoute: 'https://www.bfv.de/restapi/ticker/unlike/02K0DVSRI4000000VS5489B5VT8CT2E0',
                            ownGoal: false,
                            statistic: null,
                            substitution: null,
                            team: null,
                            text: '',
                            time: '99\'',
                            section: null,
                            options: { 
                                reportLink: {
                                    href: 'https://www.bfv.de/ticker/melden/02K0D92ETS000001VS5489B5VT8CT2E0/02K0DVSRI4000000VS5489B5VT8CT2E0/02IMKEAAPS000000VS5489B3VVETK79U',
                                    text: 'melden',
                                    title: 'Beitrag melden'
                                }, 
                                socialsharing: {
                                    services: []
                                }
                            }
                        },
                        {
                            type: 'goal',
                            card: null,
                            eventIcon: '24/football',
                            goal: {
                                teamName: 'SG Hetzles/Kleinsendelbach',
                                player: {
                                    id: '00QBSTOOPK000000VV0AG819VSKRC3V1',
                                    image: {
                                        alt: 'Torschütze',
                                        src: 'https://cdn.bfv.de/public/029U6RQNHO000000VS5489B5VVJH11S3.stamp',
                                        title: 'Torschütze'
                                    },
                                    link: {
                                        href: 'https://www.bfv.de/spieler/michael-marsing/00QBSTOOPK000000VV0AG819VSKRC3V1'
                                    },
                                    name: 'Michael Marsing',
                                    number: '12',
                                    teamLogo: {
                                        teamIcon: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKSG00000OVV0AG08LVUPGND5I',
                                        teamName: 'SG Hetzles/Kleinsendelbach'
                                    }
                                },
                                result: {
                                    halftime: false,
                                    teams: [
                                        {
                                            actualGoals: 1,
                                            teamIcon: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKSG00000OVV0AG08LVUPGND5I',
                                            type: 'home'
                                        },
                                        {
                                            actualGoals: 1,
                                            teamIcon: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKTO00000KVV0AG08LVUPGND5I',
                                            type: 'away'
                                        }
                                    ]
                                }
                            },
                            headline: 'Tor durch Michael Marsing (12)',
                            likes: 0,
                            liked: false,
                            likeApiRoute: 'https://www.bfv.de/restapi/ticker/like/02K0DS7RA0000000VS5489B5VT8CT2E0',
                            unlikeApiRoute: 'https://www.bfv.de/restapi/ticker/unlike/02K0DS7RA0000000VS5489B5VT8CT2E0',
                            ownGoal: false,
                            statistic: null,
                            substitution: null,
                            team: null,
                            text: '',
                            time: '83\'',
                            section: null,
                            options: { 
                                reportLink: {
                                    href: 'https://www.bfv.de/ticker/melden/02K0D92ETS000001VS5489B5VT8CT2E0/02K0DS7RA0000000VS5489B5VT8CT2E0/02IMKEAAPS000000VS5489B3VVETK79U',
                                    text: 'melden',
                                    title: 'Beitrag melden'
                                }, 
                                socialsharing: {
                                    services: []
                                }
                            }
                        },
                        {
                            type: 'goal',
                            card: null,
                            eventIcon: '24/football',
                            goal: { 
                                teamName: 'DJK Weingarts', 
                                player: {
                                    id: '00QBSSDU8C000000VV0AG819VSKRC3V1',
                                    image: {
                                        alt: 'Torschütze',
                                        src: 'https://cdn.bfv.de/public/02IN3LKVES000000VS5489BCVUCFOO4T.stamp',
                                        title: 'Torschütze'
                                    },
                                    link: {
                                        href: 'https://www.bfv.de/spieler/jakob-exner/00QBSSDU8C000000VV0AG819VSKRC3V1'
                                    },
                                    name: 'Jakob Exner',
                                    number: '11',
                                    teamLogo: {
                                        teamIcon: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKTO00000KVV0AG08LVUPGND5I',
                                        teamName: 'DJK Weingarts'
                                    }
                                }, 
                                result: {
                                    halftime: false,
                                    teams: [
                                        {
                                            actualGoals: 0,
                                            teamIcon: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKSG00000OVV0AG08LVUPGND5I',
                                            type: 'home'
                                        },
                                        {
                                            actualGoals: 1,
                                            teamIcon: '//service-prod.bfv.de/export.media?action=getLogo&format=7&id=00ES8GNKTO00000KVV0AG08LVUPGND5I',
                                            type: 'away'
                                        }
                                    ]
                                } 
                            },
                            headline: 'Tor durch Jakob Exner (11)',
                            likes: 0,
                            liked: false,
                            likeApiRoute: 'https://www.bfv.de/restapi/ticker/like/02K0DLI8UK000000VS5489B5VT8CT2E0',
                            unlikeApiRoute: 'https://www.bfv.de/restapi/ticker/unlike/02K0DLI8UK000000VS5489B5VT8CT2E0',
                            ownGoal: false,
                            statistic: null,
                            substitution: null,
                            team: null,
                            text: '',
                            time: '54\'',
                            section: null,
                            options: { 
                                reportLink: {
                                    href: 'https://www.bfv.de/ticker/melden/02K0D92ETS000001VS5489B5VT8CT2E0/02K0DLI8UK000000VS5489B5VT8CT2E0/02IMKEAAPS000000VS5489B3VVETK79U',
                                    text: 'melden',
                                    title: 'Beitrag melden'
                                }, 
                                socialsharing: {
                                    services: []
                                }
                            }
                        },
                        {
                            type: 'whistle',
                            card: null,
                            eventIcon: '24/whistle',
                            goal: null,
                            headline: 'Beginn der zweiten Halbzeit',
                            likes: 0,
                            liked: false,
                            likeApiRoute: 'https://www.bfv.de/restapi/ticker/like/02K0DLG830000000VS5489B6VV4DR9A5',
                            unlikeApiRoute: 'https://www.bfv.de/restapi/ticker/unlike/02K0DLG830000000VS5489B6VV4DR9A5',
                            ownGoal: false,
                            statistic: null,
                            substitution: null,
                            team: null,
                            text: '',
                            time: '46\'',
                            section: null,
                            options: { 
                                reportLink: {
                                    href: 'https://www.bfv.de/ticker/melden/02K0D92ETS000001VS5489B5VT8CT2E0/02K0DLG830000000VS5489B6VV4DR9A5/02IMKEAAPS000000VS5489B3VVETK79U',
                                    text: 'melden',
                                    title: 'Beitrag melden'
                                }, 
                                socialsharing: {
                                    services: []
                                }
                            }
                        },
                        {
                            type: 'comment',
                            card: null,
                            eventIcon: null,
                            goal: null,
                            headline: null,
                            likes: 0,
                            liked: false,
                            likeApiRoute: null,
                            unlikeApiRoute: null,
                            ownGoal: false,
                            statistic: null,
                            substitution: null,
                            team: null,
                            text: null,
                            time: null,
                            section: 'Erste Halbzeit',
                            options: null
                        },
                        {
                            type: 'whistle',
                            card: null,
                            eventIcon: '24/whistle',
                            goal: null,
                            headline: 'Halbzeit der Begegnung',
                            likes: 0,
                            liked: false,
                            likeApiRoute: 'https://www.bfv.de/restapi/ticker/like/02K0DHI2RS000000VS5489B6VV4DR9A5',
                            unlikeApiRoute: 'https://www.bfv.de/restapi/ticker/unlike/02K0DHI2RS000000VS5489B6VV4DR9A5',
                            ownGoal: false,
                            statistic: null,
                            substitution: null,
                            team: null,
                            text: '',
                            time: '52\'',
                            section: null,
                            options: { 
                                reportLink: {
                                    href: 'https://www.bfv.de/ticker/melden/02K0D92ETS000001VS5489B5VT8CT2E0/02K0DHI2RS000000VS5489B6VV4DR9A5/02IMKEAAPS000000VS5489B3VVETK79U',
                                    text: 'melden',
                                    title: 'Beitrag melden'
                                },
                                socialsharing: {
                                    services: []
                                }
                            }
                        },
                        {
                            type: 'whistle',
                            card: null,
                            eventIcon: '24/whistle',
                            goal: null,
                            headline: 'Anpfiff der Begegnung',
                            likes: 0,
                            liked: false,
                            likeApiRoute: 'https://www.bfv.de/restapi/ticker/like/02K0D93B28000000VS5489B6VV4DR9A5',
                            unlikeApiRoute: 'https://www.bfv.de/restapi/ticker/unlike/02K0D93B28000000VS5489B6VV4DR9A5',
                            ownGoal: false,
                            statistic: null,
                            substitution: null,
                            team: null,
                            text: '',
                            time: '1\'',
                            section: null,
                            options: { 
                                reportLink: {
                                    href: 'https://www.bfv.de/ticker/melden/02K0D92ETS000001VS5489B5VT8CT2E0/02K0D93B28000000VS5489B6VV4DR9A5/02IMKEAAPS000000VS5489B3VVETK79U',
                                    text: 'melden',
                                    title: 'Beitrag melden'
                                },
                                socialsharing: {
                                    services: []
                                }
                            }
                        }
                    ]
                }
            ]
        } as any);
    });
});
