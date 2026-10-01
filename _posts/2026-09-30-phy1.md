---
title: Trispectrum and Position-dependent Power Sepctrum
date: 2026-09-14
categories:
  - cosmology
tags:
  - physics
  - cosmology
  - Fourier
  - statistics
  - trispectrum
math: true
---

> Ref:
>[The Angular Trispectrum of the CMB](https://arxiv.org/pdf/astro-ph/0105117), [Weak Lensing Trispectrum and Kurt-Spectra](https://arxiv.org/pdf/2112.05155),  [Galaxy Survey Cosmology by Hannu](https://www.mv.helsinki.fi/home/hkurkisu/GSC1.pdf), [Position-dependent power spectrum](https://arxiv.org/pdf/1508.03256)


Correlation function is the most useful statistics in cosmology data analysis. With the increasing quality of survey data in the further, the demanding of higher-order statistics, $$n$$ -point correlation function and the corresponding spectra, increases too. Here we will review the complex but powerful cases of $$n=4$$ .

## Four-point correlation

We started in the most common situation that a four point correlation function in three Cartesian coordinate. For any field $$\delta(\mathbf{x})$$ defined in $$\mathbb{R}^3$$ , we can define their 4-point correlator with their Fourier mode


$$
\begin{aligned}
\langle \delta(\mathbf{k}_1)\delta(\mathbf{k}_2)\delta(\mathbf{k}_3)\delta(\mathbf{k}_4)\rangle.
\end{aligned}
$$


And using cumulant expansion, we can decompose it into two part: disconnected (Gaussian) part and connected (non-Gaussian) part


$$
\begin{aligned}
\langle \delta(\mathbf{k}_1)\delta(\mathbf{k}_2)\delta(\mathbf{k}_3)\delta(\mathbf{k}_4)\rangle
&= \langle\delta(\mathbf{k}_1)\delta(\mathbf{k}_2)\rangle\langle\delta(\mathbf{k}_3)\delta(\mathbf{k}_4)\rangle
+ \langle\delta(\mathbf{k}_1)\delta(\mathbf{k}_3)\rangle\langle\delta(\mathbf{k}_2)\delta(\mathbf{k}_4)\rangle \\
&\quad + \langle\delta(\mathbf{k}_1)\delta(\mathbf{k}_4)\rangle\langle\delta(\mathbf{k}_2)\delta(\mathbf{k}_3)\rangle
+ \langle \delta(\mathbf{k}_1)\delta(\mathbf{k}_2)\delta(\mathbf{k}_3)\delta(\mathbf{k}_4)\rangle_c.
\end{aligned}

$$


The first three terms are the disconnected part, also known as the Wick pairs. The last term is the connected part and the exact additional information of 4-point correlator comparing with 2-point.

## Trispectrum

### 3D Space

The trispectrum is the connected contribution of the 4-point correlation, as


$$
\begin{aligned}
(2\pi)^3T(k_1,k_2,k_3,k_4)\delta^D(\mathbf{k}_{1234})
&= \langle \delta(\mathbf{k}_1)\delta(\mathbf{k}_2)\delta(\mathbf{k}_3)\delta(\mathbf{k}_4)\rangle_c.
\end{aligned}
$$


But for any tetrahedron in $$\mathbb{R}^3$$ , we need $$4\times 3 - 3 -3 =6$$ degree of freedom (dof) to parameterize it (reducing 3 rotation dof and 3 translation dof), i.e. we need to know the length of two diagonal, so a full trispectrum is usually written as $$T^{\rm full}(k_1,k_2,k_3,k_4, k_{12},k_{34})$$ .

### Sphere

We also usually use the trispectrum on the sphere. With the field $$\kappa(\hat{\mathbf{n}})$$ defined in $$\mathbb{S}^2$$ , we can define a 4-point correlator with its spherical harmonic modes


$$
\begin{aligned}
\langle \kappa_{\ell_1m_2}\kappa_{\ell_2 m_2}\kappa_{\ell_3m_3}\kappa_{\ell_4m_4}\rangle.
\end{aligned}
$$


We discuss this away from 3D since they are much different then power spectrum's and bispectrum's difference in space and sphere. 

Using rotation symmetry for the correlator, a 4-point correlator in sphere can be written as


$$
\begin{aligned}
\langle \kappa_{\ell_1m_2}\kappa_{\ell_2 m_2}\kappa_{\ell_3m_3}\kappa_{\ell_4m_4}\rangle
&= \sum_{LM}(-1)^M
\begin{pmatrix}\ell_1 & \ell_2 & L \\ m_1 & m_2 & -M\end{pmatrix}
\begin{pmatrix}\ell_3 & \ell_4 & L \\ m_3 & m_4 & M\end{pmatrix}
Q^{\ell_1\ell_2}_{\ell_3\ell_4}(L).
\end{aligned}
$$


where the $$L$$ can be seen as a length of diagonal and for spherical 4-point correlator, 5 dof is complete to parameterize it ( $$4\times 2 - 3 = 5$$ ). Geometrically speaking, the $$Q^{\ell_1\ell_2}_{\ell_3\ell_4}(L)$$ is a quadrilateral component determined by two triangular ( $$\ell_1,\ell_2,L$$ ) and ( $$\ell_3,\ell_4,L$$ ) . We call ( $$\ell_1,\ell_2,\ell_3,\ell_4,L$$ ) a configuration.

There're also other two pairing method for $$\ell_1\ell_3\|\ell_2\ell_4$$ and $$\ell_1\ell_4\|\ell_2\ell_3$$ and the relation between each $$Q$$ under those configuration can be related using Wigner-6j symbols. But here, we discuss all derivation with $$\ell_1\ell_2\|\ell_3\ell_4$$ .

$$Q_{\ell_3\ell_4}^{\ell_1\ell_2}(L)$$ is also contributed by Gaussian part and non-Gaussian part, written as


$$
\begin{aligned}
Q_{\ell_3\ell_4}^{\ell_1\ell_2}(L) &= G_{\ell_3\ell_4}^{\ell_1\ell_2}(L)+T_{\ell_3\ell_4}^{\ell_1\ell_2}(L).
\end{aligned}
$$


## Local Power Spectrum

### Convention

Another useful observable is **local power spectrum** (or position dependent power spectrum). To define it, we can consider a finite survey region $$V_{\rm s}$$ and a local small region $$V_{\rm L}$$ at $$\mathbf{r}_{\rm L}$$ , in the local region we have


$$
\begin{aligned}
\delta(\mathbf{k}; \mathbf{r}_{\rm L})
&= \int_{V_{\rm L}}\mathrm{d}^3r\, \delta(\mathbf{r})\mathrm{e}^{-\mathrm{i}\mathbf{r}\cdot\mathbf{k}} \\
&= \int \mathrm{d}^3r\,\delta(\mathbf{r})W_{\rm L}(\mathbf{r}-\mathbf{r}_{\rm L})\mathrm{e}^{-\mathrm{i}\mathbf{r}\cdot\mathbf{k}} \\
&= \int \dfrac{\mathrm{d}^3 q}{(2\pi)^3}\, \delta(\mathbf{k}-\mathbf{q})W_{\rm L}(\mathbf{q})\mathrm{e}^{-\mathrm{i}\mathbf{r}_{\rm L}\cdot\mathbf{q}}.
\end{aligned}
$$


Here the last step use *Plancherel theorem* :


$$
\begin{aligned}
\int \mathrm{d}^3 x\,f(\mathbf{x})g(\mathbf{x}) &= \int \dfrac{\mathrm{d}^3 k}{(2\pi)^3}\,f^*(\mathbf{k})g(\mathbf{k}).
\end{aligned}
$$


and $$W_{\rm L}$$ is the rectangle window function selecting the region $$V_{\rm L}$$ .

Under this convention, the local power spectrum is defined as


$$
\begin{aligned}
P(k;\mathbf{r}_{\rm L})
&= \dfrac{1}{V_{\rm L}}\|\delta(\mathbf{k};\mathbf{r}_{\rm L})\|^2 \\
&= \dfrac{1}{V_{\rm L}} \int \dfrac{\mathrm{d}^3 q_1}{(2\pi)^3}\int \dfrac{\mathrm{d}^3 q_2}{(2\pi)^3}
\, \delta(-\mathbf{k}-\mathbf{q}_1)\delta(\mathbf{k}-\mathbf{q}_2)W_{\rm L}(\mathbf{q}_1)W_{\rm L}(\mathbf{q}_2)
\mathrm{e}^{-\mathrm{i}\mathbf{r}_{\rm L}\cdot(\mathbf{q}_1+\mathbf{q}_2)}.
\end{aligned}
$$


In the Fourier space for the observable, we have


$$
\begin{aligned}
P(k;q)
&= \int \mathrm{d}^3r_{\rm L}\, P(k;\mathbf{r}_{\rm L}) \mathrm{e}^{-\mathrm{i}\mathbf{r}_{\rm L}\cdot \mathbf{q}} \\
&= \dfrac{1}{V_{\rm L}}\int \dfrac{\mathrm{d}^3 q_1}{(2\pi)^3}\delta(-\mathbf{k}-\mathbf{q}_1)\delta(\mathbf{k}+\mathbf{q}+\mathbf{q}_1)
W_{\rm L}(\mathbf{q}_1)W_{\rm L}(-\mathbf{q}_1-\mathbf{q}).
\end{aligned}
$$


And we define the background overdensity 


$$
\begin{aligned}
\delta_{\rm L}(\mathbf{r}_{\rm L}) &= \dfrac{ \delta(\mathbf{k}=0;\mathbf{r}_{\rm L})}{V_{\rm L}}.
\end{aligned}
$$


and its Fourier transform


$$
\begin{aligned}
\delta_{\rm L}(\mathbf{q})
&= \int \mathrm{d}^3 r_{\rm L}\,\delta_{\rm L}(\mathbf{r}_{\rm L})\mathrm{e}^{-\mathrm{i}\mathbf{r}_{\rm L}\cdot \mathbf{q}} \\
&= \dfrac{1}{V_{\rm L}}\delta(\mathbf{q})W(-\mathbf{q}).
\end{aligned}
$$


### Approximation

To deal with the annoying $$\mathbf{q}_1$$ integral, we can make an approximation under the assumption $$q\ll k$$ :
- observables $$\delta, P$$ and spectrum $$B,T$$ (will be discussed later) just keep zero order approximation, i.e. $$k\pm q = k$$ .
- Window functions keep the first order term and are integrated:


$$
\begin{aligned}
\int \dfrac{\mathrm{d}^3q_1}{(2\pi)^3} W(\mathbf{q}_1)W(-\mathbf{q}-\mathbf{q}_1)
&= \mathscr{F}[W^2(\mathbf{x})](-\mathbf{q}) \\
&= W(-\mathbf{q}).
\end{aligned}
$$


Here $$\mathscr{F}$$ denotes the Fourier transform.

In this way, the local power spectrum in Fourier space are


$$
\begin{aligned}
P(k;q) &\simeq \dfrac{W(-\mathbf{q})}{V_{\rm L}}\delta(-\mathbf{k})\delta(\mathbf{k}+\mathbf{q}).
\end{aligned}
$$


This approximation are accurate before $$\mathcal{O}(q/k)$$ .

### Response

After squeezed approximation $$q\ll k$$ , we can expand local power spectrum as the response to local density and gravitational potential


$$
\begin{aligned}
P(k;\mathbf{r}_{\rm L}) &= P(k)[1+R_1\delta_{\rm L}(\mathbf{r}_{\rm L}) + b_\phi \Phi_{\rm L}(\mathbf{\rm L})+\mathcal{O}(\delta_{\rm L}^2)] \\
&\quad + \epsilon_{\rm L}(\mathbf{r}_{\rm L}).
\end{aligned}
$$


Here $$R_1$$ is the gravitational response, $$b_{\phi} = 4f_{\rm NL}$$ is the response to local-type non-Gaussianity and $$\epsilon_{\rm L}$$ is the noise term. We will show how the response bridge the relation between higher order statistics and $$P(k), P(q)$$ .


## Squeezed Bispectrum

Since local power spectrum is a observable at $$\mathbf{r}_{\rm L}$$ , we can calculate its cross-correlation with the background overdensity $$\delta_{\rm L}(\mathbf{r}_{\rm L})$$ . So we can get


$$
\begin{aligned}
\xi_{P\delta}(\mathbf{r}\|k)
&= \langle P(k;\mathbf{r}_{\rm L}) \delta_{\rm L}(\mathbf{r}_{\rm L}+\mathbf{r})\rangle \\
&= \dfrac{1}{V_{\rm L}^2} \int \dfrac{\mathrm{d}^3 q_1}{(2\pi)^3}\int \dfrac{\mathrm{d}^3 q_2}{(2\pi)^3}\int \dfrac{\mathrm{d}^3 q_3}{(2\pi)^3}
\, \langle\delta(-\mathbf{k}-\mathbf{q}_1)\delta(\mathbf{k}-\mathbf{q}_2)\delta(-\mathbf{q}_3)\rangle \\
&\quad \times W_{\rm L}(\mathbf{q}_1)W_{\rm L}(\mathbf{q}_2)W_{\rm L}(\mathbf{q}_3)
\mathrm{e}^{-\mathrm{i}\mathbf{r}_{\rm L}\cdot(\mathbf{q}_1+\mathbf{q}_2+\mathbf{q}_3)}\mathrm{e}^{-\mathrm{i}\mathbf{r}\cdot\mathbf{q}_3} \\
&= \dfrac{1}{V_{\rm L}^2} \int \dfrac{\mathrm{d}^3 q_1}{(2\pi)^3}\int \dfrac{\mathrm{d}^3 q_3}{(2\pi)^3}
\, B(-\mathbf{k}-\mathbf{q}_1, \mathbf{k}+\mathbf{q}_1+\mathbf{q}_3, -\mathbf{q}_3) \\
&\quad \times W_{\rm L}(\mathbf{q}_1)W_{\rm L}(-\mathbf{q}_1-\mathbf{q}_3)W_{\rm L}(\mathbf{q}_3)\mathrm{e}^{-\mathrm{i}\mathbf{r}\cdot\mathbf{q}_3}.
\end{aligned}
$$


The bispectrum is defined as $$B(\mathbf{k}_1,\mathbf{k}_2,\mathbf{k}_3)(2\pi)^3 \delta^{\rm D}(\mathbf{k}_1+\mathbf{k}_2+\mathbf{k}_3) = \langle \delta(\mathbf{k}_1)\delta(\mathbf{k}_2)\delta(\mathbf{k}_3)\rangle$$ .

So we can define the cross power spectrum between local power spectrum and background overdensity


$$
\begin{aligned}
P_{P\delta}(q\|k)
&= \int \mathrm{d}^3 r \,\xi_{P\delta}(\mathbf{r}\|k)\mathrm{e}^{-\mathrm{i}\mathbf{r}\cdot\mathbf{q}} \\
&= \dfrac{1}{V_{\rm L}^2} \int \dfrac{\mathrm{d}^3 q_1}{(2\pi)^3}\int \dfrac{\mathrm{d}^3 q_3}{(2\pi)^3}\int \mathrm{d}^3 r\,
B(-\mathbf{k}-\mathbf{q}_1, \mathbf{k}+\mathbf{q}_1+\mathbf{q}_3, -\mathbf{q}_3) \\
&\quad \times W_{\rm L}(\mathbf{q}_1)W_{\rm L}(-\mathbf{q}_1-\mathbf{q}_3)W_{\rm L}(\mathbf{q}_3)\mathrm{e}^{-\mathrm{i}\mathbf{r}\cdot(\mathbf{q}_3+\mathbf{q})} \\
&=\dfrac{1}{V_{\rm L}^2} \int \dfrac{\mathrm{d}^3 q_1}{(2\pi)^3}
B(-\mathbf{k}-\mathbf{q}_1, \mathbf{k}+\mathbf{q}_1-\mathbf{q}, \mathbf{q}) \\
&\quad \times W_{\rm L}(\mathbf{q}_1)W_{\rm L}(\mathbf{q}-\mathbf{q}_1)W_{\rm L}(-\mathbf{q}).
\end{aligned}
$$


Use the squeezed limit $$q\ll k$$ , we have


$$
\begin{aligned}
P_{P\delta }(q\|k) &\simeq \dfrac{\|W(q)\|^2}{V_{\rm L}^2}B(-\mathbf{k},\mathbf{k}-\mathbf{q},\mathbf{q}) \\
&:= \dfrac{\|W(q)\|^2}{V_{\rm L}^2}B_{\rm sq}(k,q).
\end{aligned}
$$


This can also be derived from $$P_{P\delta}(q\|k) = \langle P(k;-q)\delta_{\rm L}(\mathbf{q})\rangle$$ where $$-q$$ making the momentum conserved. In this definition, the response model gives


$$
\begin{aligned}
B_{\rm sq}(k,q) &= \left[ R_1(k) + \dfrac{4f_{\rm NL}}{\alpha(q)}\right]P(k)P(q).
\end{aligned}
$$


where $$\alpha (q)$$ comes from the Poisson equation $$\Phi_{\rm L}(q) = \delta(q)/\alpha(q)$$ , $$\alpha(q) = \dfrac{2q^2 T^2(q)D(z)}{3\Omega_{\rm m}H_0^2}$$ .


## Collapsed Trispectrum

Alternative trispectrum is usually hard to be measured since they have 6 free parameters. But similar to bispectrum, we can focus on special configuration of it. In this section, we take space trispectrum as example to discuss a configuration called **collapsed trispectrum**, which have $$\|\mathbf{k}_1+\mathbf{k}_2\| =  \|\mathbf{k}_3 +\mathbf{k}_4\| \ll \min(k_1,k_2,k_3,k_4)$$ .

Similar to bispectrum, we can construct the trispectrum by calculating the local power spectrum auto-correlation function


$$
\begin{aligned}
\xi_{PP}(\mathbf{r}\|k,k')
&= \langle P(k;\mathbf{r}_{\rm L}) P(k';\mathbf{r}_{\rm L}+\mathbf{r})\rangle \\
&= \dfrac{1}{V_{\rm L}^2} \int \dfrac{\mathrm{d}^3 q_1}{(2\pi)^3}\int \dfrac{\mathrm{d}^3 q_2}{(2\pi)^3}
\int \dfrac{\mathrm{d}^3 q_3}{(2\pi)^3}\int \dfrac{\mathrm{d}^3 q_4}{(2\pi)^3} \\
&\quad \times \langle\delta(-\mathbf{k}-\mathbf{q}_1)\delta(\mathbf{k}-\mathbf{q}_2)
\delta(-\mathbf{k}'-\mathbf{q}_3)\delta(\mathbf{k}'-\mathbf{q}_4)\rangle \\
&\quad \times W_{\rm L}(\mathbf{q}_1)W_{\rm L}(\mathbf{q}_2)W_{\rm L}(\mathbf{q}_3)W_{\rm L}(\mathbf{q}_4)
\mathrm{e}^{-\mathrm{i}\mathbf{r}_{\rm L}\cdot(\mathbf{q}_1+\mathbf{q}_2+\mathbf{q}_3+\mathbf{q}_4)} \\
&\quad \times \mathrm{e}^{-\mathrm{i}\mathbf{r}\cdot(\mathbf{q}_3+\mathbf{q}_4)}.
\end{aligned}
$$


To avoid heavy calculation, we can just consider it in Fourier space where we have


$$
\begin{aligned}
P'_{PP}(q\|k,k') &= \langle P(k;q)P(k';-q)\rangle' \\
&\simeq \dfrac{\|W(q)\|^2}{V_{\rm L}^2}T (-\mathbf{k},\mathbf{k}+\mathbf{q},-\mathbf{k}',\mathbf{k}'-\mathbf{q}) \\
&:= \dfrac{\|W(q)\|^2}{V_{\rm L}^2}T_{\rm coll}(k,k',q).
\end{aligned}
$$


Here we use prime to denote the connected statistics.

Also the response gives 


$$
\begin{aligned}
T_{\rm coll}(k,k',q)
&= \left[R_1(k)R_1(k')
+\dfrac{4f_{\rm NL}(R_1(k)+R_1(k'))}{\alpha(q)}
+\dfrac{(100/9)\tau_{\rm NL}}{\alpha^2(q)} \right]P(k)P(k')P(q).
\end{aligned}
$$


$$\tau_{\rm NL}$$ are defined in inflation theory that $$T_{\zeta} \supset \tau_{\rm NL}(P_{\zeta}P_{\zeta}P_{\zeta}(k_{12}) + 12{\rm perm.})$$  and in single field inflation it satisfies $$\tau_{\rm NL} = \left(\dfrac{6}{5} f_{\rm NL}\right)^2$$ .

> Disconnected term should be treated carefully when doing research. But we won't discuss it now.