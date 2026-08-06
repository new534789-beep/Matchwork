# Extraction du guide d'orientation MESRS

Chaîne qui produit `lib/orientation/donnees/filieres-publiques.json` à partir du
PDF officiel « Guide d'information et de sensibilisation des nouveaux bacheliers
(Licence) », MESRS Bénin.

À rejouer une fois par an, à la parution du nouveau guide.

## Pourquoi une chaîne en plusieurs étapes

Les 90 pages de tableaux du guide sont **imprimées à la verticale** : le texte y
est pivoté de 90°, et une extraction directe rend des mots dans le désordre. On
redresse donc le PDF avant de lire les tableaux.

## Étapes

```bash
pip install pdfplumber pypdf
python rotate.py       # pivote le PDF de -90° -> guide_rot2.pdf
python extract2.py     # texte redressé, pour relecture humaine
python tables_all.py   # extraction structurée des tableaux -> tables_all.json
python build.py        # normalisation -> lib/orientation/donnees/filieres-publiques.json
```

Les chemins sont en dur en tête de chaque fichier : les adapter avant de lancer.

## Ce que fait `build.py`

Pour chaque filière, il résout **série par série** la liste des créneaux de la
formule de classement. Un créneau est une position de la formule ; il peut
offrir plusieurs matières alternatives (le candidat prend celle qu'il a passée).

Le guide en attend trois. La colonne « Matières » du guide encode des règles
conditionnelles qu'il faut interpréter :

| Forme dans le guide | Sens |
|---|---|
| `Maths (C, D)` | ce créneau ne vaut que pour les séries C et D |
| `SVT (PE pour EA)` | SVT, remplacé par PE pour la série EA |
| `Anglais (LV1 pour A et B)` | Anglais ; « LV1 » précise, ne restreint pas |
| `Espagnol / Allemand` | un seul créneau, deux matières acceptées |
| `Pour DEAT : toutes les trois (03) matières écrites` | règle DEAT, quelle que soit la filière |

## Deux points de prudence

**Les filières sur concours n'ont pas de moyenne de classement.** Leur colonne
« Matières » décrit les épreuves de l'examen d'entrée. `build.py` ne leur
applique pas la règle des trois créneaux et les marque `calculable: false`.

**Le guide est parfois ambigu.** Certaines fiches listent plus de trois matières
sans dire laquelle remplace laquelle. Elles sortent avec `aVerifier: true` et le
détail dans `alertes`, plus le texte brut dans `source`. Il ne faut jamais
deviner une formule à la place du candidat : l'afficher comme incertaine et
renvoyer vers apresmonbac.bj.
