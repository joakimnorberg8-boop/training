# GAYM v4 – evidence & practical defaults

The app uses practical starting estimates, not medical prescriptions. Real body-weight and performance trends should be used to adjust intake over time.

- Resting energy: Mifflin–St Jeor equation.
- Daily energy: resting energy is multiplied by a conventional activity multiplier (1.20 / 1.375 / 1.55 / 1.725) to produce a usable TDEE starting estimate.
- Build muscle: target starts roughly 250–400 kcal above estimated maintenance. This is deliberately moderate. The precise ideal energy surplus for hypertrophy is not known, and very large surpluses can add unnecessary fat.
- Build muscle protein: 2.0 g/kg/day. This sits inside the commonly supported 1.6–2.2 g/kg/day range used in resistance-training nutrition literature.
- Maintain: estimated maintenance calories, protein around 1.8 g/kg/day.
- Lose weight: moderate deficit of roughly 15%, bounded to about 300–500 kcal/day, with protein at 2.0 g/kg/day to make muscle retention a priority alongside resistance training.
- Strength exercise defaults: generally 3 working sets with exercise-specific repetition ranges. These are editable because effective hypertrophy can occur across a broad rep range when sets are sufficiently challenging and progressive overload is present.
- Rehab exercises are examples and intentionally conservative. Rehab should be individualized when an injury or clinical condition is involved.

Useful reading:
- Is an Energy Surplus Required to Maximize Skeletal Muscle Hypertrophy Associated With Resistance Training? (Sports Medicine / PMC)
- Protein and hypertrophy literature summarized in resistance-training nutrition reviews (commonly 1.6–2.2 g/kg/day)
- Mifflin–St Jeor resting-energy equation

## v11 recipes and fiber
- Bottom-friendly is a GAYM category for fiber-rich whole-food meals, not a medical claim.
- Fiber target uses the common dietary-guideline density of about 14 g fiber per 1,000 kcal; beans, lentils, whole grains, berries and similar foods are used heavily in that category.
- Recipe calories/macros are estimates based on the listed ingredient quantities and should be treated as practical logging estimates, not laboratory values.
- Built-in recipe imagery in v14 was replaced with higher-resolution food photography selected to visually match each listed recipe. The files are stored locally with the app.


## v12 custom recipes
- Custom recipe metadata is stored with the existing local app data.
- User recipe photos are compressed in-browser and stored separately in IndexedDB (`gaymRecipeImages`) to avoid bloating localStorage.
- Built-in and custom recipes share the same `recipeCard()` and recipe-detail renderer, so image placement and card layout stay identical.
- Custom recipe photos are local to the current browser/device until a backend/cloud storage service is added.


## v14 built-in recipe images
The previous low-resolution built-in recipe assets were removed/replaced. Current local image assets were selected to closely match the listed ingredients and dish style.

- Beef & Lentil Power Bowl: Marley Spoon beef/grains bowl photography.
- High Protein Beef Burrito Bowl: Ayleen Recipes beef burrito bowl photography.
- Creamy Beef Pasta: Yummy / creamy beef pasta photography.
- Korean Beef Rice Bowl: Eat With Clarity beef teriyaki bowl photography.
- Thai Peanut Tofu Noodles: At Elizabeth's Table Thai noodle bowl photography.
- Beef & Black Bean Chili: The Spice Lab black bean/corn chili photography.
- Protein Oats with Berries: Clean Food Crush berry-banana oatmeal photography.
- Norwegian Skyr Berry Bowl: Arise skyr/oats/fruit bowl photography.
- Beef, Quinoa & Bean Stuffed Peppers: A Dash of Megnut stuffed pepper photography.

For a public/commercial release, verify redistribution/licensing rights for each third-party food photograph or replace them with owned/licensed photography.
## GAYM home mascot
- `assets/glitter_unicorn.webp` is an OpenAI-generated original unicorn artwork created for this GAYM build. The animated WebP is derived locally from that generated artwork with subtle motion and sparkle frames.



## Kai training plan
The built-in Kai program in v16 is transcribed from the training-plan screenshot supplied by the user in the conversation. It uses the app's existing strength-session engine rather than a separate workout implementation.


## v17 app behavior
- Added manual backdated workout history entries and per-session deletion.
- Cardio active sessions count down from target duration; optional distance is captured when finishing.


## v18 calendar logging
- Forgotten workouts are now logged from My Plan by tapping today or any earlier calendar date.
- Future dates only allow planning; today/past dates expose a direct log-workout action.
- The previous History entry-point for logging past workouts was removed to keep one clear flow.


## Bottom-friendly classification (v20)
- The app no longer treats Bottom-friendly as a cuisine or user-entered tag. It is computed from nutrition data.
- Classification requires at least 10 g fiber per serving and at least 14 g fiber per 1,000 kcal. The 14 g/1,000 kcal benchmark follows U.S. dietary-fiber guidance; the 10 g serving minimum is an app threshold so the badge only appears on meaningfully fiber-rich meals.
- Evidence base used for the concept: AHRQ/NCBI 2025 systematic review on fiber and laxation; NIDDK fiber guidance; San Francisco AIDS Foundation bottoming resources noting that adequate fiber can support regularity but high-fiber foods can also accelerate bowel motility and individual timing/tolerance matters.
- This badge is for everyday bowel-regularity support, not a guarantee of same-day anal-sex preparation.
