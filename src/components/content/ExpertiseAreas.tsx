'use client';

import { useEffect, useRef, useState } from 'react';

import { Compass, Leaf, Map, UsersRound } from 'lucide-react';

const areas = [
    {
        icon: Map,
        title: 'Integrale gebiedsontwikkeling',
        projects: [
            {
                name: 'Masterplan Zuidoost',
                description:
                    'Grootschalig stedelijk vernieuwingsprogramma in Amsterdam Zuidoost, met inclusie en participatie in de kern.'
            },
            {
                name: 'Arenapoort',
                description: 'Gebiedsontwikkeling rond de Arenapoort, met oog voor bewoners en lokale waarde.'
            },
            {
                name: 'G-Buurt Moving Forward',
                description: 'Bewonerscommunity met een eigen buurtplatform en een gedragen buurtplan.'
            }
        ]
    },
    {
        icon: Leaf,
        title: 'Energie & duurzaamheids-transities',
        projects: [
            {
                name: 'Gebiedsgericht SLIM',
                description: 'Sociale en democratische werkpakketten binnen een rechtvaardige energietransitie.'
            },
            {
                name: 'Energie van Utrecht',
                description: 'Lokale energiebeweging waarin bewoners meebouwen aan de transitie.'
            },
            {
                name: 'Donut Economie',
                description: 'De donut-economie vertaald naar de dagelijkse praktijk van wijk en stad.'
            },
            {
                name: 'Groene Hub',
                description: 'Groene plek waar duurzame initiatieven uit de buurt samenkomen en groeien.'
            }
        ]
    },
    {
        icon: UsersRound,
        title: 'Sociale innovatie, participatie & democratisering',
        projects: [
            {
                name: 'Living Labs',
                description: 'Proeftuinen waarin overheid, kennis en gemeenschap samen experimenteren.'
            },
            {
                name: 'Buurtplatformen',
                description: 'Plekken waar bewoners zich organiseren en samen hun buurt vormgeven.'
            },
            {
                name: 'Fieldlabs',
                description: 'Praktijkomgevingen om nieuwe vormen van samenwerking te testen.'
            },
            {
                name: 'Participatieverordening',
                description: 'Nieuwe spelregels voor echte zeggenschap van bewoners in beleid.'
            }
        ]
    },
    {
        icon: Compass,
        title: 'Circulaire economie & lokaal ondernemen',
        projects: [
            {
                name: '2PING (lokale munt)',
                description: 'Circulaire lokale munt die waarde vasthoudt in de community van Zuidoost.'
            },
            {
                name: 'Donut Deals',
                description: 'Afspraken tussen partners in gelijkwaardig partnerschap, geïnspireerd op de donut-economie.'
            },
            {
                name: 'Meer Ondernemen',
                description: 'Programma dat lokaal ondernemerschap ruimte, partners en podium geeft.'
            }
        ]
    }
];

const ExpertiseAreas = () => {
    const [open, setOpen] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Tik buiten de projecten sluit de open omschrijving (touch-gedrag).
    useEffect(() => {
        if (!open) return;

        const onPointer = (event: PointerEvent) => {
            if (listRef.current && !listRef.current.contains(event.target as Node)) setOpen(null);
        };
        document.addEventListener('pointerdown', onPointer);

        return () => document.removeEventListener('pointerdown', onPointer);
    }, [open]);

    return (
        <div className='expertise-grid' ref={listRef}>
            {areas.map((area) => {
                const Icon = area.icon;

                return (
                    <article key={area.title} className='expertise-card'>
                        <div className='expertise-card__head'>
                            <Icon aria-hidden className='h-6 w-6 shrink-0 text-[#E88A32]' />
                            <h3>{area.title}</h3>
                        </div>
                        <ul className='project-chips'>
                            {area.projects.map((project) => {
                                const isOpen = open === project.name;

                                return (
                                    <li key={project.name} className='project-chip-wrap'>
                                        <button
                                            type='button'
                                            className={`project-chip${isOpen ? ' project-chip--open' : ''}`}
                                            aria-expanded={isOpen}
                                            onClick={() => setOpen(isOpen ? null : project.name)}>
                                            {project.name}
                                        </button>
                                        <span role='tooltip' className='project-chip__tip'>
                                            {project.description}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </article>
                );
            })}
        </div>
    );
};

export default ExpertiseAreas;
