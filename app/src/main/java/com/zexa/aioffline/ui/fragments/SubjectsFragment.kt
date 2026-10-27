package com.zexa.aioffline.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.zexa.aioffline.databinding.FragmentSubjectsBinding
import com.zexa.aioffline.viewmodel.SubjectsViewModel
import kotlinx.coroutines.launch

class SubjectsFragment : Fragment() {

    private var _binding: FragmentSubjectsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SubjectsViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSubjectsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        binding.rvSubjects.layoutManager = LinearLayoutManager(requireContext())
        
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.subjects.collect { subjects ->
                if (subjects.isNotEmpty()) {
                    binding.tvNoSubjects.visibility = View.GONE
                    binding.rvSubjects.visibility = View.VISIBLE
                    binding.rvSubjects.adapter = object : RecyclerView.Adapter<SubjectViewHolder>() {
                        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SubjectViewHolder {
                            val v = LayoutInflater.from(parent.context).inflate(android.R.layout.simple_list_item_1, parent, false)
                            return SubjectViewHolder(v)
                        }
                        override fun onBindViewHolder(holder: SubjectViewHolder, position: Int) {
                            (holder.itemView as TextView).text = subjects[position]
                            holder.itemView.setOnClickListener {
                                // Detail view for subjects can be added here
                            }
                        }
                        override fun getItemCount() = subjects.size
                    }
                } else {
                    binding.tvNoSubjects.visibility = View.VISIBLE
                    binding.rvSubjects.visibility = View.GONE
                }
            }
        }
    }

    class SubjectViewHolder(view: View) : RecyclerView.ViewHolder(view)

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
