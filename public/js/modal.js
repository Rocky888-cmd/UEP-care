// Modal handling
export function initModal() {
    const modal = document.getElementById('submitModal');
    const openButtons = [
        document.getElementById('open-submit'),
        document.getElementById('start-submit')
    ];
    const closeButton = document.getElementById('close-modal');
    const cancelButton = document.getElementById('cancel');
    const submitAnotherButton = document.getElementById('submitAnother');

    function openModal(e) {
        if (e) e.preventDefault();
        if (!modal) return;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        resetForm();

        // Remove #submit from URL if present
        if (window.location.hash === '#submit') {
            history.pushState('', document.title, window.location.pathname + window.location.search);
        }
    }

    function resetForm() {
        const form = document.getElementById('concernForm');
        const afterSubmit = document.getElementById('afterSubmit');
        const imagePreview = document.getElementById('imagePreview');

        form.reset();
        form.classList.remove('hidden');
        afterSubmit.classList.add('hidden');
        imagePreview.innerHTML = '';

        // Reset submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }

    // Clear form fields without toggling visibility (used after successful submit)
    function clearFormFields() {
        const form = document.getElementById('concernForm');
        const imagePreview = document.getElementById('imagePreview');
        if (!form) return;
        form.reset();
        if (imagePreview) imagePreview.innerHTML = '';
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            submitBtn.disabled = false;
            if (btnText) btnText.classList.remove('hidden');
            if (btnLoading) btnLoading.classList.add('hidden');
        }
    }
    // Expose a safe global helper (fallback) so inline scripts can clear fields
    try {
        window.clearFormFields = clearFormFields;
    } catch (err) {
        // ignore (non-browser env)
    }

    // Event Listeners
    openButtons.forEach(btn => {
        if (btn) btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (closeButton) closeButton.addEventListener('click', closeModal);
    if (cancelButton) cancelButton.addEventListener('click', closeModal);
    if (submitAnotherButton) submitAnotherButton.addEventListener('click', resetForm);

    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle URL hash (#submit)
    window.addEventListener('load', () => {
        if (window.location.hash === '#submit') openModal();
    });

    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#submit') openModal();
        else closeModal();
    });

    // Handle image preview (guarded)
    const attachmentsInput = document.getElementById('attachments');
    const imagePreview = document.getElementById('imagePreview');
    const maxFiles = attachmentsInput ? parseInt(attachmentsInput.dataset.maxFiles || '4', 10) : 4;

    // Inside modal.js, replace this section:
    if (attachmentsInput && imagePreview && !window._fileInputListenerAttached) {
        attachmentsInput.addEventListener('change', () => {
            imagePreview.innerHTML = '';
            const files = Array.from(attachmentsInput.files).slice(0, maxFiles);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    img.classList.add('preview-thumb');
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });

            if (attachmentsInput.files.length > maxFiles) {
                alert(`Maximum ${maxFiles} images allowed. Only the first ${maxFiles} images will be used.`);
            }
        });

        window._fileInputListenerAttached = true; // ✅ prevents duplicates
    }


    // Handle copy ticket code (attach dynamically)
    function attachCopyListener() {
        const copyCodeBtn = document.getElementById('copyCode');
        if (!copyCodeBtn) return;

        copyCodeBtn.addEventListener('click', async () => {
            const code = document.getElementById('ticketCode')?.textContent;
            if (!code) return;

            try {
                await navigator.clipboard.writeText(code);

                // ✅ visual feedback
                const icon = copyCodeBtn.querySelector('svg');
                const original = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#16a34a" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19l12-12-1.41-1.41z"/>
        </svg>
      `;
                setTimeout(() => { copyCodeBtn.innerHTML = original; }, 2000);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
                alert('Could not copy ticket code.');
            }
        });
    }

    // Attach once DOM loaded
    window.addEventListener('load', attachCopyListener);

    // Also reattach when success section becomes visible
    const afterSubmit = document.getElementById('afterSubmit');
    if (afterSubmit) {
        const observer = new MutationObserver(() => attachCopyListener());
        observer.observe(afterSubmit, { childList: true, subtree: true });
    }

}

// Form submission handling
export function initFormSubmission(onSubmit) {
    const form = document.getElementById('concernForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Disable submit button and show loading
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');

        try {
            await onSubmit(e);

            // Clear inputs, then show success state
            try { clearFormFields(); } catch (e) { /* ignore */ }
            form.classList.add('hidden');
            document.getElementById('afterSubmit').classList.remove('hidden');

            document.querySelector('.modal-content').scrollTop = 0;

        } catch (err) {
            console.error('Submission error:', err);
            alert('Error submitting concern: ' + err.message);

            // Re-enable submit button
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    });
}