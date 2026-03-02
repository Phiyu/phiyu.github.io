---
layout: single
title: "Cosmological Simulations & Tidal Field Data"
permalink: /sim/
author_profile: true
---

## README

This page hosts a collection of **tidal field datasets** derived from cosmological simulations. Tidal tensor fields capture the anisotropic gravitational environment, crucial for understanding structure formation, galaxy-halo relations, and large-scale structure studies.

**Current Dataset Status:**
- **TNG-100**: 2 snapshots with multiple grid resolutions and particle assignment schemes
- **ELUCID**: 2 snapshots from the gravity-only constrained N-body simulation

**Data Specifications:**
Each tidal field file (2-5 GB) includes:
- Tidal tensor components: $\partial_i \partial_j \Phi / a^2$ computed from particle density
- Multiple smoothing scales (adaptive to cosmological resolution)
- Particle assignment schemes: NGP (Nearest Grid Point) and CIC (Cloud-In-Cell)
- Full-sky coverage at specified redshifts

**Storage & Access:**
Files are hosted on Quark Cloud Drive (夸克网盘) for reliable domestic access. International mirror and advanced query features (DataTables.js) will be added in future updates.

---

## Datasets

### TNG-100: Illustris TNG Suite

**Simulation Properties:**
- Box size: 110.7 Mpc/h
- Particle count: 1024³ (dark matter)
- Cosmology: Planck 2015
- Public data release at [TNG Project](https://www.tng-project.org/)

#### Snapshot z=0 (a=1.0)

**Grid: 512³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-ngp-z0-512)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-cic-z0-512)

**Grid: 1024³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-ngp-z0-1024)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-cic-z0-1024)

#### Snapshot z=0.5 (a≈0.67)

**Grid: 512³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-ngp-z05-512)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-cic-z05-512)

**Grid: 1024³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-ngp-z05-1024)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-cic-z05-1024)

---

### ELUCID: Evolved unLikely Coalescences for Initial Density

**Simulation Properties:**
- Box size: 500 Mpc/h (periodic)
- Particle count: 1024³ (dark matter)
- Constraints: Constrained to match peculiar velocities within 100 Mpc/h of Milky Way
- Cosmology: WMAP7
- Public data at [ELUCID Project](https://cosmosim.org/simulation/ELUCID/)

#### Snapshot z=0 (a=1.0)

**Grid: 512³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-ngp-z0-512)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-cic-z0-512)

**Grid: 1024³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-ngp-z0-1024)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-cic-z0-1024)

#### Snapshot z=0.3 (a≈0.77)

**Grid: 512³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-ngp-z03-512)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-cic-z03-512)

**Grid: 1024³**
- NGP assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-ngp-z03-1024)
- CIC assignment: [Download (Quark)](https://pan.quark.cn/s/your-quark-link-elucid-cic-z03-1024)

---

## Future Updates

- [ ] Interactive sortable/filterable table (DataTables.js)
- [ ] International CDN mirrors (Zenodo, HuggingFace Hub)
- [ ] Additional simulations: Quijote, FLAME, etc.
- [ ] File metadata & checksums for validation
- [ ] Direct analysis tools (HDF5 viewers, visualization)

---

*Last updated: March 2026*
